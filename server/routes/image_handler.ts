import { Router, type Request, type Response } from 'express';
import { storage } from '../storage';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import express from 'express';
import { db } from '../db';
import { images3, users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { Dropbox } from 'dropbox';

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
router.get('/images3', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const images3Data = await db.select().from(images3);
    res.json(Array.isArray(images3Data) ? images3Data : []);
  } catch (error) {
    console.error('Error fetching images3 data:', error);
    res.status(500).json({ error: 'Failed to fetch images3 data' });
  }
});

// Get user's API keys
router.get('/user/keys', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { dropbox2_api_key, dropbox2_app_key, dropbox2_app_secret, openai2_api_key } = user[0];
    res.json({
      dropbox2_api_key,
      dropbox2_app_key,
      dropbox2_app_secret,
      openai2_api_key
    });
  } catch (error) {
    console.error('Error fetching user API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Save user's API keys
router.post('/user/keys', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { dropbox2_api_key, dropbox2_app_key, dropbox2_app_secret, openai2_api_key } = req.body;

    await db.update(users)
      .set({
        dropbox2_api_key,
        dropbox2_app_key,
        dropbox2_app_secret,
        openai2_api_key
      })
      .where(eq(users.id, req.user.id));

    res.json({ message: 'API keys saved successfully' });
  } catch (error) {
    console.error('Error saving API keys:', error);
    res.status(500).json({ error: 'Failed to save API keys' });
  }
});

// Generate image using OpenAI and save to Dropbox
router.post('/generate-image', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get user's API keys
    const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { openai2_api_key, dropbox2_api_key } = user[0];
    if (!openai2_api_key || !dropbox2_api_key) {
      return res.status(400).json({ error: 'API keys not configured' });
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: openai2_api_key });

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL returned from OpenAI');
    }

    const imageUrl = response.data[0].url;

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Initialize Dropbox
    const dropbox = new Dropbox({ accessToken: dropbox2_api_key });

    // Upload to Dropbox
    const fileName = `generated_${Date.now()}.png`;
    const uploadResponse = await dropbox.filesUpload({
      path: `/${fileName}`,
      contents: imageBuffer
    });

    if (!uploadResponse.path_display) {
      throw new Error('Failed to upload file to Dropbox');
    }

    // Get the shared link
    const sharedLinkResponse = await dropbox.sharingCreateSharedLink({
      path: uploadResponse.path_display
    });

    if (!sharedLinkResponse.url) {
      throw new Error('Failed to create shared link');
    }

    // Save to database
    const newImage = await db.insert(images3).values({
      id: undefined, // Let the database auto-generate the ID
      rel_images3_plans_id: 1, // You might want to create a plan first
      img_file_url1: sharedLinkResponse.url,
      img_file_extension: 'png',
      img_file_size: imageBuffer.byteLength,
      width: 1024,
      height: 1024
    }).returning();

    res.json(newImage[0]);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

export default router; 