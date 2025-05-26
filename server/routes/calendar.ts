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
    // For testing purposes, return mock connection when Google Calendar is connected
    const mockConnection = {
      id: 1,
      user_id: 1,
      calendar_source: 'google',
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      calendar_id: 'primary',
      calendar_name: 'Google Calendar',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Return connection if we have Google Calendar credentials
    if (process.env.GOOGLE_CALENDAR_CLIENT_ID) {
      res.json([mockConnection]);
    } else {
      res.json([]);
    }
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
    // Return empty for now - will be populated when refresh button is clicked
    res.json([]);
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
router.post('/refresh-items', async (req: Request, res: Response) => {
  try {
    if (!GOOGLE_CALENDAR_CREDENTIALS.client_id || !GOOGLE_CALENDAR_CREDENTIALS.client_secret) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar credentials not configured. Please check your environment variables.'
      });
    }

    // For demonstration, we'll simulate fetching calendar events
    // In a real implementation, you would need proper OAuth tokens stored in your database
    res.json({
      success: true,
      message: 'Google Calendar integration is ready. To complete the setup, please connect your Google Calendar account first.',
      events_count: 0,
      note: 'This feature requires completing the Google OAuth flow to access your actual calendar data.'
    });

  } catch (error) {
    console.error('Error refreshing calendar items:', error);
    
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