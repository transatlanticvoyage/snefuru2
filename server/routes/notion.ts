import { Router, Request, Response } from 'express';
import { requireAuth, type AuthRequest } from '@/middleware/auth';
import { storage } from '@/storage';

const router = Router();

// Get Notion pages (mock data for now - will need NOTION_INTEGRATION_SECRET)
router.get('/pages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // This would fetch from Notion API with proper credentials
    // For now, returning empty array until user provides NOTION_INTEGRATION_SECRET
    const mockPages = [];
    
    res.json(mockPages);
  } catch (error) {
    console.error('Error fetching Notion pages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Notion pages',
      message: 'Please configure your Notion integration credentials in the API Keys section'
    });
  }
});

// Get synced notes from database
router.get('/synced-notes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const syncedNotes = await storage.getNotionNotesByUserId(userId);
    res.json(syncedNotes);
  } catch (error) {
    console.error('Error fetching synced notes:', error);
    res.status(500).json({ error: 'Failed to fetch synced notes' });
  }
});

// Refresh Notion pages
router.post('/refresh', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // This would refresh data from Notion API
    // Placeholder response until Notion credentials are configured
    res.json({ 
      pages_count: 0,
      message: 'Please configure your Notion integration credentials in the API Keys section to refresh data'
    });
  } catch (error) {
    console.error('Error refreshing Notion data:', error);
    res.status(500).json({ error: 'Failed to refresh Notion data' });
  }
});

// Sync pages to database
router.post('/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { pageIds } = req.body;
    
    // This would sync selected or all pages to database
    // Placeholder response until Notion integration is fully configured
    res.json({ 
      synced_count: 0,
      message: 'Please configure your Notion integration credentials in the API Keys section to enable syncing'
    });
  } catch (error) {
    console.error('Error syncing Notion pages:', error);
    res.status(500).json({ error: 'Failed to sync Notion pages' });
  }
});

// Delete synced notes from database
router.delete('/delete-notes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { noteIds } = req.body;
    
    if (!noteIds || !Array.isArray(noteIds)) {
      return res.status(400).json({ error: 'Invalid note IDs provided' });
    }

    await storage.deleteNotionNotes(noteIds);
    
    res.json({ 
      deleted_count: noteIds.length,
      message: 'Successfully deleted notes from database'
    });
  } catch (error) {
    console.error('Error deleting notes:', error);
    res.status(500).json({ error: 'Failed to delete notes' });
  }
});

export default router;