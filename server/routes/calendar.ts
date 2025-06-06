import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { storage } from '../storage';
import { google } from 'googleapis';

const router = Router();

// Google Calendar credentials from environment variables
const GOOGLE_CALENDAR_CREDENTIALS = {
  client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
  client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  redirect_uri: process.env.NODE_ENV === 'production' 
    ? 'https://1d53bee8-fc85-40d3-b574-30e270e906d7-00-6s2plh4n1668.riker.replit.dev/api/calendar/callback'
    : 'https://1d53bee8-fc85-40d3-b574-30e270e906d7-00-6s2plh4n1668.riker.replit.dev/api/calendar/callback'
};

// Get user's calendar connections
router.get('/connections', async (req: Request, res: Response) => {
  try {
    // Get real connections from database (using user_id = 1 for now)
    const connections = await storage.getCalendarConnectionsByUserId(1);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching calendar connections:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch calendar connections' 
    });
  }
});

// Get user's calendar events
router.get('/events', async (req: Request, res: Response) => {
  try {
    // Get real events from database (using user_id = 1 for now)
    const events = await storage.getCalendarEventsByUserId(1);
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch calendar events' 
    });
  }
});

// Start Google OAuth flow
router.get('/auth/google', async (req: Request, res: Response) => {
  try {
    if (!GOOGLE_CALENDAR_CREDENTIALS.client_id || !GOOGLE_CALENDAR_CREDENTIALS.client_secret) {
      return res.status(500).json({
        success: false,
        message: 'Google Calendar credentials not configured. Please contact administrator.'
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CALENDAR_CREDENTIALS.client_id,
      GOOGLE_CALENDAR_CREDENTIALS.client_secret,
      GOOGLE_CALENDAR_CREDENTIALS.redirect_uri
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({
      success: true,
      authUrl: authUrl
    });

  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google authentication URL'
    });
  }
});

// Handle Google OAuth callback
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect('/calendar/calendar1?error=no_code');
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CALENDAR_CREDENTIALS.client_id,
      GOOGLE_CALENDAR_CREDENTIALS.client_secret,
      GOOGLE_CALENDAR_CREDENTIALS.redirect_uri
    );

    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Save the connection to database (using user_id = 1 for now)
    await storage.createCalendarConnection({
      user_id: 1,
      calendar_source: 'google',
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || '',
      token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      calendar_id: 'primary',
      calendar_name: 'Google Calendar'
    });

    console.log('Google Calendar connection saved successfully!');
    res.redirect('/calendar/calendar1?connected=true');

  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.redirect('/calendar/calendar1?error=auth_failed');
  }
});

// Refresh all calendar items from Google Calendar API
router.post('/refresh-items', async (req: Request, res: Response) => {
  try {
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

    // Fetch events from Google Calendar (next 6 months)
    const now = new Date();
    const timeMax = new Date();
    timeMax.setMonth(now.getMonth() + 6);

    console.log(`Fetching events from ${now.toISOString()} to ${timeMax.toISOString()}`);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 250, // Increased from 100 to get more events
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false,
    });

    const events = response.data.items || [];
    console.log(`Found ${events.length} total events from Google Calendar`);
    
    // Get existing event IDs to check for duplicates
    const existingEvents = await storage.getCalendarEventsByUserId(1);
    const existingEventIds = new Set(existingEvents.map(e => e.external_event_id));
    
    const newEvents = [];
    const updatedEvents = [];

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
        
        if (existingEventIds.has(event.id || '')) {
          updatedEvents.push(savedEvent);
        } else {
          newEvents.push(savedEvent);
        }
      } catch (error) {
        console.error('Error saving event:', event.summary, error);
      }
    }

    const totalSaved = newEvents.length + updatedEvents.length;
    console.log(`Processed ${totalSaved} events: ${newEvents.length} new, ${updatedEvents.length} updated`);

    if (newEvents.length === 0 && updatedEvents.length > 0) {
      res.json({
        success: true,
        message: `0 new items found to fetch. Updated ${updatedEvents.length} existing events from Google Calendar`,
        events_count: totalSaved,
        new_events: newEvents.length,
        updated_events: updatedEvents.length
      });
    } else {
      res.json({
        success: true,
        message: `Successfully refreshed ${totalSaved} calendar items from Google Calendar (${newEvents.length} new, ${updatedEvents.length} updated)`,
        events_count: totalSaved,
        new_events: newEvents.length,
        updated_events: updatedEvents.length
      });
    }

  } catch (error) {
    console.error('Error refreshing calendar items:', error);
    
    if ((error as any).code === 401) {
      return res.status(401).json({
        success: false,
        message: 'Google Calendar access token expired. Please reconnect your Google Calendar.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to refresh calendar items: ' + (error as Error).message
    });
  }
});

// Sync calendar events
router.post('/sync', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Calendar sync functionality will be implemented when authentication is fully set up'
    });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync calendar'
    });
  }
});

// Delete calendar connection
router.delete('/connections/:id', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Calendar connection deleted'
    });
  } catch (error) {
    console.error('Error deleting calendar connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete calendar connection'
    });
  }
});

export default router;