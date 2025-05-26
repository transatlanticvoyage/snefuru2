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
      return res.json({
        success: false,
        message: 'To fetch your real Google Calendar events, you need to first complete the Google OAuth connection. Click "Connect Google Calendar" to authenticate with your Google account and grant access to your calendar data.',
        events_count: 0,
        action_required: 'Please complete Google Calendar OAuth authentication first'
      });
    } catch (error) {
      console.error('Error refreshing calendar items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh calendar items'
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
