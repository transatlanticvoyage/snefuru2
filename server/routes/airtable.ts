import { Router, type Request, type Response } from 'express';
import { storage } from '../storage';
import { requireAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

// Get Airtable records
router.get('/records', async (req: Request, res: Response) => {
  try {
    const userId = 1; // For now, use a default user ID

    // Get user's Airtable credentials from storage
    const user = await storage.getUser(userId);
    if (!user?.api_keys?.airtable) {
      return res.status(400).json({
        success: false,
        message: 'Airtable credentials not configured. Please add your Airtable API key, Base ID, and Table ID in the API Keys section.'
      });
    }

    const { apiKey, baseId, tableId } = user.api_keys.airtable;

    if (!apiKey || !baseId || !tableId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Airtable credentials. Please check your API key, Base ID, and Table ID in the API Keys section.'
      });
    }

    // Import node-fetch dynamically
    const fetch = (await import('node-fetch')).default;

    // Fetch records from Airtable
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const response = await fetch(airtableUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', response.status, errorText);
      return res.status(response.status).json({
        success: false,
        message: `Airtable API error: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    res.json(data.records || []);

  } catch (error) {
    console.error('Error fetching Airtable records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch records from Airtable'
    });
  }
});

// Get synced tasks from database
router.get('/synced-tasks', async (req: Request, res: Response) => {
  try {
    const userId = 1;
    const tasks = await storage.getAirtableTasksByUserId(userId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching synced tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch synced tasks'
    });
  }
});

// Refresh Airtable data
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const userId = 1;

    // Get user's Airtable credentials
    const user = await storage.getUser(userId);
    if (!user?.api_keys?.airtable) {
      return res.status(400).json({
        success: false,
        message: 'Airtable credentials not configured'
      });
    }

    const { apiKey, baseId, tableId } = user.api_keys.airtable;

    // Import node-fetch dynamically
    const fetch = (await import('node-fetch')).default;

    // Fetch fresh data from Airtable
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const response = await fetch(airtableUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    const records = data.records || [];

    res.json({
      success: true,
      message: `Refreshed ${records.length} records from Airtable`,
      records_count: records.length
    });

  } catch (error) {
    console.error('Error refreshing Airtable data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh Airtable data'
    });
  }
});

// Sync records with database
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const userId = 1;
    const { recordIds } = req.body;

    // Get user's Airtable credentials
    const user = await storage.getUser(userId);
    if (!user?.api_keys?.airtable) {
      return res.status(400).json({
        success: false,
        message: 'Airtable credentials not configured'
      });
    }

    const { apiKey, baseId, tableId } = user.api_keys.airtable;

    // Import node-fetch dynamically
    const fetch = (await import('node-fetch')).default;

    // Fetch records from Airtable
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const response = await fetch(airtableUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    let recordsToSync = data.records || [];

    // Filter to specific records if recordIds provided
    if (recordIds && recordIds.length > 0) {
      recordsToSync = recordsToSync.filter((record: any) => recordIds.includes(record.id));
    }

    let syncedCount = 0;

    // Sync each record to database
    for (const record of recordsToSync) {
      try {
        const taskData = {
          user_id: userId,
          airtable_id: record.id,
          name: record.fields.Name || 'Untitled Task',
          status: record.fields.Status || 'Todo',
          due_date: record.fields['Due Date'] || null,
          priority: record.fields.Priority || null,
          description: record.fields.Description || null,
          assignee: record.fields.Assignee || null,
          tags: record.fields.Tags || null,
          last_synced: new Date().toISOString()
        };

        // Check if task already exists
        const existingTask = await storage.getAirtableTaskByAirtableId(record.id);
        
        if (existingTask) {
          // Update existing task
          await storage.updateAirtableTask(existingTask.id, taskData);
        } else {
          // Create new task
          await storage.createAirtableTask(taskData);
        }

        syncedCount++;
      } catch (error) {
        console.error(`Error syncing record ${record.id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Successfully synced ${syncedCount} records`,
      synced_count: syncedCount
    });

  } catch (error) {
    console.error('Error syncing with Airtable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync with Airtable'
    });
  }
});

export default router;