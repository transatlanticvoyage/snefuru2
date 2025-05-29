import { Router, type Request, type Response } from 'express';
import { storage } from '../storage';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import express from 'express';
import { db } from '../db';
import { images3 } from '../../shared/schema';

const router = Router();

// Get all image batches
router.get('/batches', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const batches = await storage.getAllImageBatches();
    res.json({
      success: true,
      batches
    });
  } catch (error) {
    console.error('Error fetching image batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image batches'
    });
  }
});

// Get images in a batch
router.get('/batches/:batchId/images', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const batchId = parseInt(req.params.batchId);
    if (isNaN(batchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    const images = await storage.getImagesByBatchId(batchId);
    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images'
    });
  }
});

// Get all images3 data
router.get('/images3', requireAuth, async (req, res) => {
  try {
    const images3Data = await db.select().from(images3);
    res.json(images3Data);
  } catch (error) {
    console.error('Error fetching images3 data:', error);
    res.status(500).json({ error: 'Failed to fetch images3 data' });
  }
});

export default router; 