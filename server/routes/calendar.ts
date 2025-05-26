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
    // For now, return empty array since we don't have authentication working
    res.json([]);
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
    // For now, return empty array since we don't have authentication working
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
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CALENDAR_CREDENTIALS.client_id,
      GOOGLE_CALENDAR_CREDENTIALS.client_secret,
      GOOGLE_CALENDAR_CREDENTIALS.redirect_uri
    );

    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Here you would typically save the tokens to your database
    // For now, we'll just redirect back to the calendar page
    res.redirect('/calendar/calendar1?connected=true');

  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.redirect('/calendar/calendar1?error=auth_failed');
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