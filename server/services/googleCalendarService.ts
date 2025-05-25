/**
 * Google Calendar API Integration Service
 */
import { google } from 'googleapis';
import type { CalendarEvent, InsertCalendarEvent, InsertCalendarConnection } from '@shared/schema';

interface GoogleCalendarCredentials {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

interface GoogleCalendarEventData {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
  organizer?: { email: string; displayName?: string };
  status?: string;
  recurringEventId?: string;
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  created?: string;
  updated?: string;
  htmlLink?: string;
  attachments?: Array<{ title: string; fileUrl: string }>;
}

/**
 * Initialize Google Calendar OAuth2 client
 */
export function createGoogleCalendarClient(credentials: GoogleCalendarCredentials): any {
  const { client_id, client_secret, redirect_uri } = credentials;
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );
  
  return oauth2Client;
}

/**
 * Generate Google OAuth2 authorization URL
 */
export function getGoogleAuthUrl(oauth2Client: any): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ];
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  
  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(oauth2Client: any, code: string): Promise<GoogleCalendarTokens> {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    };
  } catch (error) {
    throw new Error(`Failed to exchange code for tokens: ${error.message}`);
  }
}

/**
 * Set tokens for the OAuth2 client
 */
export function setClientTokens(oauth2Client: any, tokens: GoogleCalendarTokens): void {
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date
  });
}

/**
 * Refresh access token if needed
 */
export async function refreshTokenIfNeeded(oauth2Client: any): Promise<GoogleCalendarTokens | null> {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    
    return {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expiry_date: credentials.expiry_date
    };
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

/**
 * Get list of user's calendars
 */
export async function getUserCalendars(oauth2Client: any): Promise<Array<{ id: string; name: string; primary?: boolean }>> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const response = await calendar.calendarList.list();
    const calendars = response.data.items || [];
    
    return calendars.map(cal => ({
      id: cal.id || '',
      name: cal.summary || 'Unnamed Calendar',
      primary: cal.primary || false
    }));
  } catch (error) {
    throw new Error(`Failed to fetch calendars: ${error.message}`);
  }
}

/**
 * Fetch events from a specific calendar
 */
export async function getCalendarEvents(
  oauth2Client: any, 
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 250
): Promise<GoogleCalendarEventData[]> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const params: any = {
      calendarId,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    };
    
    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;
    
    const response = await calendar.events.list(params);
    const events = response.data.items || [];
    
    return events as GoogleCalendarEventData[];
  } catch (error) {
    throw new Error(`Failed to fetch calendar events: ${error.message}`);
  }
}

/**
 * Convert Google Calendar event to our database format
 */
export function convertGoogleEventToDbFormat(
  googleEvent: GoogleCalendarEventData,
  userId: number,
  connectionId: number
): InsertCalendarEvent {
  // Parse start and end times
  const startDateTime = googleEvent.start.dateTime || googleEvent.start.date;
  const endDateTime = googleEvent.end.dateTime || googleEvent.end.date;
  
  const isAllDay = !googleEvent.start.dateTime;
  
  // Extract date and time components
  let startDate: string, startTime: string | null = null;
  let endDate: string, endTime: string | null = null;
  
  if (isAllDay) {
    startDate = googleEvent.start.date!;
    endDate = googleEvent.end.date!;
  } else {
    const startDateObj = new Date(startDateTime!);
    const endDateObj = new Date(endDateTime!);
    
    startDate = startDateObj.toISOString().split('T')[0];
    startTime = startDateObj.toTimeString().split(' ')[0];
    endDate = endDateObj.toISOString().split('T')[0];
    endTime = endDateObj.toTimeString().split(' ')[0];
  }
  
  // Extract attendees
  const attendees = googleEvent.attendees?.map(att => att.email) || [];
  
  // Determine event type based on content
  let eventType = 'other';
  const title = googleEvent.summary?.toLowerCase() || '';
  if (title.includes('meeting') || title.includes('call') || title.includes('standup')) {
    eventType = 'meeting';
  } else if (title.includes('appointment') || title.includes('doctor') || title.includes('dentist')) {
    eventType = 'appointment';
  } else if (title.includes('reminder') || title.includes('remember')) {
    eventType = 'reminder';
  } else if (title.includes('task') || title.includes('todo')) {
    eventType = 'task';
  }
  
  // Determine priority based on keywords
  let priority = 'medium';
  if (title.includes('urgent') || title.includes('important') || title.includes('critical')) {
    priority = 'high';
  } else if (title.includes('low') || title.includes('optional')) {
    priority = 'low';
  }
  
  // Extract reminder minutes
  let reminderMinutes = 15;
  if (googleEvent.reminders?.overrides && googleEvent.reminders.overrides.length > 0) {
    reminderMinutes = googleEvent.reminders.overrides[0].minutes;
  }
  
  // Extract attachments
  const attachments = googleEvent.attachments?.map(att => att.title) || [];
  
  return {
    user_id: userId,
    connection_id: connectionId,
    external_event_id: googleEvent.id,
    title: googleEvent.summary || 'Untitled Event',
    description: googleEvent.description || null,
    start_date: startDate,
    start_time: startTime,
    end_date: endDate,
    end_time: endTime,
    location: googleEvent.location || null,
    attendees: attendees,
    organizer: googleEvent.organizer?.email || null,
    calendar_source: 'google',
    event_type: eventType,
    status: googleEvent.status === 'cancelled' ? 'cancelled' : 
            googleEvent.status === 'tentative' ? 'tentative' : 'confirmed',
    priority: priority,
    is_all_day: isAllDay,
    is_recurring: !!googleEvent.recurringEventId,
    recurrence_pattern: googleEvent.recurrence?.join(', ') || null,
    reminder_minutes: reminderMinutes,
    timezone: googleEvent.start.timeZone || 'UTC',
    color: '#4285f4', // Default Google blue
    is_starred: false,
    is_flagged: false,
    is_important: priority === 'high',
    notes: null,
    meeting_url: googleEvent.htmlLink || null,
    attachments: attachments,
    external_created_at: googleEvent.created ? new Date(googleEvent.created) : null,
    external_updated_at: googleEvent.updated ? new Date(googleEvent.updated) : null
  };
}

/**
 * Sync calendar events for a user connection
 */
export async function syncCalendarEvents(
  oauth2Client: any,
  userId: number,
  connectionId: number,
  calendarId: string = 'primary'
): Promise<InsertCalendarEvent[]> {
  try {
    // Fetch events from the last 30 days and next 365 days
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);
    
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 365);
    
    const googleEvents = await getCalendarEvents(
      oauth2Client,
      calendarId,
      timeMin.toISOString(),
      timeMax.toISOString()
    );
    
    // Convert to our database format
    const dbEvents = googleEvents.map(event => 
      convertGoogleEventToDbFormat(event, userId, connectionId)
    );
    
    return dbEvents;
  } catch (error) {
    throw new Error(`Failed to sync calendar events: ${error.message}`);
  }
}