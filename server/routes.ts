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

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for generating images
  app.post("/api/generate", async (req, res) => {
    try {
      // Validate the request data
      const validatedData = imageGenerationRequestSchema.parse(req.body);
      const { spreadsheetData, aiModel, storageService, wpCredentials } = validatedData;
      
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
          
          // Publish to WordPress only if credentials are provided
          if (wpCredentials.url && wpCredentials.username && wpCredentials.password) {
            await publishToWordPress(
              uploadedUrl,
              row.file_name,
              wpCredentials
            );
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
