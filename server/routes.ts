import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  imageGenerationRequestSchema, 
  insertImageBatchSchema, 
  spreadsheetRowSchema,
  type SpreadsheetRow
} from "@shared/schema";
import { generateImage } from "./services/aiService";
import { uploadToCloudStorage } from "./services/cloudStorageService";
import { publishToWordPress } from "./services/wordpressService";
import OpenAI from "openai";
import authRoutes from "./routes/auth";
import calendarRoutes from "./routes/calendar";
import redditRoutes from "./routes/reddit";
import chatRoutes from "./routes/chat";
import { optionalAuth, type AuthRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  app.use('/api/auth', authRoutes);
  
  // Add the refresh route FIRST without authentication  
  app.post('/api/calendar/refresh-items', async (req, res) => {
    try {
      const { google } = require('googleapis');
      
      // Google Calendar credentials
      const GOOGLE_CALENDAR_CREDENTIALS = {
        client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
        client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        redirect_uri: process.env.NODE_ENV === 'production' 
          ? 'https://1d53bee8-fc85-40d3-b574-30e270e906d7-00-6s2plh4n1668.riker.replit.dev/api/calendar/callback'
          : 'https://1d53bee8-fc85-40d3-b574-30e270e906d7-00-6s2plh4n1668.riker.replit.dev/api/calendar/callback'
      };

      if (!GOOGLE_CALENDAR_CREDENTIALS.client_id || !GOOGLE_CALENDAR_CREDENTIALS.client_secret) {
        return res.status(400).json({
          success: false,
          message: 'Google Calendar credentials not configured. Please check your environment variables.'
        });
      }

      // Get stored Google Calendar connection from database
      const connections = await storage.getCalendarConnectionsByUserId(1);
      const googleConnection = connections.find(conn => conn.calendar_source === 'google');
      
      if (!googleConnection || !googleConnection.access_token) {
        return res.json({
          success: false,
          message: 'Google Calendar access token not found. Please connect your Google Calendar first.',
          events_count: 0,
          action_required: 'oauth_connection'
        });
      }

      // Set up OAuth2 client with stored tokens
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CALENDAR_CREDENTIALS.client_id,
        GOOGLE_CALENDAR_CREDENTIALS.client_secret,
        GOOGLE_CALENDAR_CREDENTIALS.redirect_uri
      );

      oauth2Client.setCredentials({
        access_token: googleConnection.access_token,
        refresh_token: googleConnection.refresh_token,
      });

      // Initialize Google Calendar API
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Fetch events from Google Calendar (next 30 days)
      const now = new Date();
      const timeMax = new Date();
      timeMax.setDate(now.getDate() + 30);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      const savedEvents = [];

      // Store events in database
      for (const event of events) {
        if (!event.start || !event.end) continue;

        const eventData = {
          user_id: 1,
          connection_id: googleConnection.id,
          external_event_id: event.id || '',
          title: event.summary || 'Untitled Event',
          description: event.description || null,
          start_date: event.start.date || event.start.dateTime?.split('T')[0] || '',
          start_time: event.start.dateTime ? new Date(event.start.dateTime).toTimeString().slice(0, 8) : '00:00:00',
          end_date: event.end.date || event.end.dateTime?.split('T')[0] || '',
          end_time: event.end.dateTime ? new Date(event.end.dateTime).toTimeString().slice(0, 8) : '23:59:59',
          location: event.location || null,
          attendees: event.attendees?.map((a: any) => a.email).filter(Boolean) || [],
          organizer: event.organizer?.email || null,
          calendar_source: 'google',
          event_type: 'other',
          priority: 'medium',
          status: event.status || 'confirmed',
          is_recurring: !!event.recurringEventId,
          timezone: event.start.timeZone || 'UTC'
        };

        try {
          const savedEvent = await storage.upsertCalendarEvent(eventData);
          savedEvents.push(savedEvent);
        } catch (error) {
          console.error('Error saving event:', event.summary, error);
        }
      }

      res.json({
        success: true,
        message: `Successfully refreshed ${savedEvents.length} calendar items from Google Calendar`,
        events_count: savedEvents.length
      });

    } catch (error) {
      console.error('Error refreshing calendar items:', error);
      
      if (error.code === 401) {
        return res.status(401).json({
          success: false,
          message: 'Google Calendar access token expired. Please reconnect your Google Calendar.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to refresh calendar items: ' + error.message
      });
    }
  });

  // Register calendar routes
  app.use('/api/calendar', calendarRoutes);
  
  // Register Reddit routes
  app.use('/api/reddit', redditRoutes);
  
  // Register Chat routes
  app.use('/api/chat', chatRoutes);
  
  // Apply optional authentication to all routes
  app.use(optionalAuth);
  // Test route for reddit_urls1 table
  app.post("/api/test-reddit-url", async (req, res) => {
    try {
      const testUrl = await storage.createRedditUrl({
        url1: "https://reddit.com/test",
        note1: "Test URL"
      });
      return res.status(200).json({ message: "Test successful", data: testUrl });
    } catch (error) {
      console.error("Error testing reddit_urls1 table:", error);
      return res.status(500).json({ message: "Error testing table", error: String(error) });
    }
  });

  // API route for generating images
  app.post("/api/generate", async (req, res) => {
    try {
      // Validate the request data
      const validatedData = imageGenerationRequestSchema.parse(req.body);
      const { spreadsheetData, aiModel, storageService, wpCredentials } = validatedData;
      
      // Determine if we should publish to WordPress based on credentials
      const shouldPublishToWordPress = wpCredentials && 
        wpCredentials.url && 
        wpCredentials.url !== '' && 
        wpCredentials.username && 
        wpCredentials.username !== '' &&
        wpCredentials.password && 
        wpCredentials.password !== '';
      
      // Validate spreadsheet data has required fields
      const validRows: SpreadsheetRow[] = [];
      for (const row of spreadsheetData) {
        try {
          const validRow = spreadsheetRowSchema.parse(row);
          validRows.push(validRow);
        } catch (error) {
          // Skip invalid rows
          console.error("Invalid row data:", row, error);
        }
      }
      
      if (validRows.length === 0) {
        return res.status(400).json({ 
          message: "No valid rows found in spreadsheet data. Each row must contain 'actual_prompt_for_image_generating_ai_tool' and 'file_name' fields." 
        });
      }
      
      // Create a new image batch
      const newBatch = await storage.createImageBatch({ note1: `Batch with ${validRows.length} images` });
      
      // Process each row and generate images
      const results = [];
      for (const row of validRows) {
        try {
          // Generate the image using the selected AI model
          const imageResult = await generateImage(
            row.actual_prompt_for_image_generating_ai_tool, 
            aiModel
          );
          
          // Upload to selected cloud storage
          const uploadedUrl = await uploadToCloudStorage(
            imageResult.base64Data,
            row.file_name,
            storageService
          );
          
          // Publish to WordPress only if credentials are provided and valid
          if (shouldPublishToWordPress) {
            try {
              await publishToWordPress(
                uploadedUrl,
                row.file_name,
                wpCredentials
              );
              console.log(`Successfully published ${row.file_name} to WordPress`);
            } catch (wpError) {
              console.error(`Error publishing to WordPress:`, wpError);
              // Continue with the process even if WordPress publishing fails
            }
          } else {
            console.log(`Skipping WordPress publishing for ${row.file_name} - no credentials provided`);
          }
          
          // Save image metadata to database
          const savedImage = await storage.createImage({
            img_url1: uploadedUrl,
            rel_img_batch_id: newBatch.id
          });
          
          results.push(savedImage);
        } catch (error) {
          console.error(`Error processing row:`, row, error);
          // Continue with next row on error
        }
      }
      
      return res.status(200).json({ 
        message: "Image generation completed", 
        batchId: newBatch.id,
        count: results.length,
        images: results
      });
    } catch (error) {
      console.error("Error generating images:", error);
      return res.status(400).json({ 
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(", ") 
          : "Error processing request" 
      });
    }
  });
  
  // API route to get image batches
  app.get("/api/batches", async (_req, res) => {
    try {
      const batches = await storage.getAllImageBatches();
      return res.status(200).json(batches);
    } catch (error) {
      console.error("Error fetching image batches:", error);
      return res.status(500).json({ message: "Error fetching image batches" });
    }
  });
  
  // API route to get images in a batch
  app.get("/api/batches/:batchId/images", async (req, res) => {
    try {
      const batchId = parseInt(req.params.batchId);
      if (isNaN(batchId)) {
        return res.status(400).json({ message: "Invalid batch ID" });
      }
      
      const images = await storage.getImagesByBatchId(batchId);
      return res.status(200).json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      return res.status(500).json({ message: "Error fetching images" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
