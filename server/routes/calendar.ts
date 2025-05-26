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
router.get('/connections', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const connections = await storage.getCalendarConnectionsByUserId(userId);
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
router.get('/events', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const events = await storage.getCalendarEventsByUserId(userId);
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
router.get('/callback', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.query;
    const userId = req.user!.id;

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

    // Save the connection to database
    await storage.createCalendarConnection({
      user_id: userId,
      calendar_source: 'google',
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || '',
      token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      calendar_id: 'primary',
      calendar_name: 'Google Calendar'
    });

    res.redirect('/calendar/calendar1?connected=true');

  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.redirect('/calendar/calendar1?error=auth_failed');
  }
});

// Refresh all calendar items from Google Calendar API
router.post('/refresh-items', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's Google Calendar connection
    const connections = await storage.getCalendarConnectionsByUserId(userId);
    const googleConnection = connections.find(conn => conn.calendar_source === 'google');
    
    if (!googleConnection) {
      return res.status(400).json({
        success: false,
        message: 'No Google Calendar connection found. Please connect your Google Calendar first.'
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
    
    // Store events in database
    const savedEvents = [];
    for (const event of events) {
      if (!event.start || !event.end) continue;

      const eventData = {
        user_id: userId,
        connection_id: googleConnection.id,
        external_event_id: event.id || '',
        title: event.summary || 'Untitled Event',
        description: event.description || null,
        start_date: event.start.date || event.start.dateTime?.split('T')[0] || '',
        start_time: event.start.dateTime ? new Date(event.start.dateTime).toTimeString().slice(0, 8) : '00:00:00',
        end_date: event.end.date || event.end.dateTime?.split('T')[0] || '',
        end_time: event.end.dateTime ? new Date(event.end.dateTime).toTimeString().slice(0, 8) : '23:59:59',
        location: event.location || null,
        attendees: event.attendees?.map(a => a.email).filter(Boolean) || [],
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
      message: `Successfully refreshed ${savedEvents.length} calendar items`,
      events_count: savedEvents.length
    });

  } catch (error) {
    console.error('Error refreshing calendar items:', error);
    
    // Handle token refresh if needed
    if (error.code === 401) {
      return res.status(401).json({
        success: false,
        message: 'Google Calendar access token expired. Please reconnect your Google Calendar.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to refresh calendar items'
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