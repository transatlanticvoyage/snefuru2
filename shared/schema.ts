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

// Reddit URLs table
export const reddit_urls1 = pgTable("reddit_urls1", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  url1: text("url1").notNull(),
  note1: text("note1"),
});

// Users table - enhanced for full user account system
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  last_login: timestamp("last_login"),
  profile_image: text("profile_image"),
  is_active: integer("is_active").default(1),
  user_role: text("user_role").default("user"),
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

export const insertRedditUrlSchema = createInsertSchema(reddit_urls1).omit({
  id: true,
  created_at: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  last_login: true,
  is_active: true,
});

// Export types
export type InsertImage = z.infer<typeof insertImageSchema>;
export type InsertImageBatch = z.infer<typeof insertImageBatchSchema>;
export type InsertRedditUrl = z.infer<typeof insertRedditUrlSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Image = typeof images.$inferSelect;
export type ImageBatch = typeof image_batches.$inferSelect;
export type User = typeof users.$inferSelect;

// Additional schema types for the application
export const wpCredentialsSchema = z.object({
  url: z.string().url().optional().or(z.literal('')),
  username: z.string().min(1).optional().or(z.literal('')),
  password: z.string().min(1).optional().or(z.literal('')),
  application_password: z.string().optional().or(z.literal('')),
  post_id: z.string().optional().or(z.literal('')),
  mapping_key: z.string().optional().or(z.literal('')),
});

export const imageGenerationRequestSchema = z.object({
  spreadsheetData: z.array(z.record(z.string())),
  aiModel: z.enum(['openai', 'midjourney', 'gemini']),
  storageService: z.enum(['google_drive', 'dropbox', 'amazon_s3']),
  wpCredentials: wpCredentialsSchema,
});

// User auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"]
});

export const userSettingsSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  profile_image: z.string().optional(),
  current_password: z.string().optional(),
  new_password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirm_new_password: z.string().optional(),
}).refine(data => {
  // If any password field is filled, they all must be filled
  const passwordFields = [data.current_password, data.new_password, data.confirm_new_password];
  const somePasswordFields = passwordFields.some(Boolean);
  const allPasswordFields = passwordFields.every(Boolean);
  return !somePasswordFields || allPasswordFields;
}, {
  message: "All password fields are required to change password",
  path: ["current_password"]
}).refine(data => {
  // If new passwords are provided, they must match
  if (data.new_password && data.confirm_new_password) {
    return data.new_password === data.confirm_new_password;
  }
  return true;
}, {
  message: "New passwords do not match",
  path: ["confirm_new_password"]
});

export const spreadsheetRowSchema = z.object({
  actual_prompt_for_image_generating_ai_tool: z.string(),
  file_name: z.string(),
});

// Export auth types
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type SpreadsheetRow = z.infer<typeof spreadsheetRowSchema>;
