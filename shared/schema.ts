import { pgTable, text, serial, timestamp, integer, boolean, date, time, jsonb, varchar } from "drizzle-orm/pg-core";
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
  user_id: integer("user_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  url1: text("url1").notNull(),
  note1: text("note1"),
});

// Reddit Organic Positions table for comprehensive keyword tracking
export const reddit_organic_positions = pgTable("reddit_organic_positions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  keyword: varchar("keyword", { length: 500 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  position: integer("position"),
  previous_position: integer("previous_position"),
  position_change: integer("position_change"),
  search_volume: integer("search_volume"),
  cpc: varchar("cpc", { length: 20 }),
  competition: varchar("competition", { length: 50 }),
  traffic: integer("traffic"),
  traffic_cost: varchar("traffic_cost", { length: 20 }),
  timestamp: varchar("timestamp", { length: 50 }),
  location: varchar("location", { length: 100 }),
  device: varchar("device", { length: 50 }),
  search_engine: varchar("search_engine", { length: 50 }).default('google'),
  language: varchar("language", { length: 10 }).default('en'),
  date_captured: varchar("date_captured", { length: 50 }),
  serp_features: text("serp_features"),
  difficulty: varchar("difficulty", { length: 20 }),
  visibility: varchar("visibility", { length: 20 }),
  estimated_clicks: integer("estimated_clicks"),
  click_through_rate: varchar("click_through_rate", { length: 20 }),
  title: text("title"),
  description: text("description"),
  meta_description: text("meta_description"),
  h1_tag: text("h1_tag"),
  word_count: integer("word_count"),
  page_authority: varchar("page_authority", { length: 20 }),
  domain_authority: varchar("domain_authority", { length: 20 }),
  backlinks: integer("backlinks"),
  referring_domains: integer("referring_domains"),
  social_shares: integer("social_shares"),
  raw_page_fetched_1: text("raw_page_fetched_1"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Calendar integration tables
export const calendar_connections = pgTable("calendar_connections", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  calendar_source: varchar("calendar_source", { length: 50 }).notNull(), // 'google', 'outlook', 'apple', 'busycal'
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
  token_expires_at: timestamp("token_expires_at"),
  calendar_id: varchar("calendar_id", { length: 255 }),
  calendar_name: varchar("calendar_name", { length: 255 }),
  is_active: boolean("is_active").default(true),
  last_sync: timestamp("last_sync"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const notion_notes = pgTable("notion_notes", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  notion_id: varchar("notion_id", { length: 255 }).unique(),
  title: varchar("title", { length: 500 }),
  status: varchar("status", { length: 100 }),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags"),
  content_preview: text("content_preview"),
  notion_url: varchar("notion_url", { length: 500 }),
  created_time: timestamp("created_time"),
  last_edited_time: timestamp("last_edited_time"),
  last_synced: timestamp("last_synced").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const calendar_events = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  connection_id: integer("connection_id").notNull(),
  external_event_id: varchar("external_event_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  start_date: date("start_date").notNull(),
  start_time: time("start_time"),
  end_date: date("end_date").notNull(),
  end_time: time("end_time"),
  location: text("location"),
  attendees: jsonb("attendees").default([]), // Array of email addresses
  organizer: varchar("organizer", { length: 255 }),
  calendar_source: varchar("calendar_source", { length: 50 }).notNull(),
  event_type: varchar("event_type", { length: 50 }).default('other'), // 'meeting', 'appointment', 'reminder', 'task', 'other'
  status: varchar("status", { length: 50 }).default('confirmed'), // 'confirmed', 'tentative', 'cancelled'
  priority: varchar("priority", { length: 20 }).default('medium'), // 'high', 'medium', 'low'
  is_all_day: boolean("is_all_day").default(false),
  is_recurring: boolean("is_recurring").default(false),
  recurrence_pattern: text("recurrence_pattern"),
  reminder_minutes: integer("reminder_minutes").default(15),
  timezone: varchar("timezone", { length: 100 }).default('UTC'),
  color: varchar("color", { length: 20 }).default('#4285f4'),
  is_starred: boolean("is_starred").default(false),
  is_flagged: boolean("is_flagged").default(false),
  is_important: boolean("is_important").default(false),
  notes: text("notes"),
  meeting_url: text("meeting_url"),
  attachments: jsonb("attachments").default([]), // Array of attachment URLs/names
  external_created_at: timestamp("external_created_at"),
  external_updated_at: timestamp("external_updated_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  last_synced: timestamp("last_synced").defaultNow(),
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

export const insertRedditOrganicPositionSchema = createInsertSchema(reddit_organic_positions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  last_login: true,
  is_active: true,
});

export const insertCalendarConnectionSchema = createInsertSchema(calendar_connections).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendar_events).omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_synced: true,
});

// Export types
export type InsertImage = z.infer<typeof insertImageSchema>;
export type InsertImageBatch = z.infer<typeof insertImageBatchSchema>;
export type InsertRedditUrl = z.infer<typeof insertRedditUrlSchema>;
export type InsertRedditOrganicPosition = z.infer<typeof insertRedditOrganicPositionSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCalendarConnection = z.infer<typeof insertCalendarConnectionSchema>;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type Image = typeof images.$inferSelect;
export type ImageBatch = typeof image_batches.$inferSelect;
export type RedditOrganicPosition = typeof reddit_organic_positions.$inferSelect;
export type User = typeof users.$inferSelect;
export type CalendarConnection = typeof calendar_connections.$inferSelect;
export type CalendarEvent = typeof calendar_events.$inferSelect;

// Additional schema types for the application
export type WpCredentials = {
  url: string;
  username: string;
  password: string;
  post_id: string;
  mapping_key: string;
  application_password?: string;
};

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

interface ApiKeysState {
  openai: string;
  dropbox: string;
  midjourney: string;
  gemini: string;
  googledrive: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  amazons3: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
  dataforseo: {
    login: string;
    password: string;
  };
  wordpress: {
    url: string;
    username: string;
    password: string;
  };
  webScraping: {
    scraperapi: {
      apiKey: string;
    };
    oxylabs: {
      username: string;
      password: string;
    };
    brightdata: {
      username: string;
      password: string;
      endpoint: string;
    };
  };
}