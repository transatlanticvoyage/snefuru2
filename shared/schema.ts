import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Images table
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  img_url1: text("img_url1").notNull(),
  rel_img_batch_id: integer("rel_img_batch_id").notNull(),
});

// Image batches table
export const image_batches = pgTable("image_batches", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  note1: text("note1"),
});

// Users table (kept from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Create insert schemas
export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  created_at: true,
});

export const insertImageBatchSchema = createInsertSchema(image_batches).omit({
  id: true,
  created_at: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Export types
export type InsertImage = z.infer<typeof insertImageSchema>;
export type InsertImageBatch = z.infer<typeof insertImageBatchSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Image = typeof images.$inferSelect;
export type ImageBatch = typeof image_batches.$inferSelect;
export type User = typeof users.$inferSelect;

// Additional schema types for the application
export const wpCredentialsSchema = z.object({
  url: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
  post_id: z.string().optional(),
  mapping_key: z.string().optional(),
});

export const imageGenerationRequestSchema = z.object({
  spreadsheetData: z.array(z.record(z.string())),
  aiModel: z.enum(['openai', 'midjourney', 'gemini']),
  storageService: z.enum(['google_drive', 'dropbox', 'amazon_s3']),
  wpCredentials: wpCredentialsSchema,
});

export type WpCredentials = z.infer<typeof wpCredentialsSchema>;
export type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>;

// Minimal spreadsheet data validation schema
export const spreadsheetRowSchema = z.object({
  actual_prompt_for_image_generating_ai_tool: z.string().min(1),
  file_name: z.string().min(1),
});

export type SpreadsheetRow = z.infer<typeof spreadsheetRowSchema>;
