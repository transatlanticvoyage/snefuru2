import { 
  images, 
  image_batches, 
  reddit_urls1,
  reddit_organic_positions,
  calendar_connections,
  calendar_events,
  type Image, 
  type ImageBatch, 
  type InsertImage, 
  type InsertImageBatch,
  type InsertRedditUrl,
  type RedditOrganicPosition,
  type InsertRedditOrganicPosition,
  type CalendarConnection,
  type CalendarEvent,
  type InsertCalendarConnection,
  type InsertCalendarEvent,
  users, 
  type User, 
  type InsertUser 
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";

// Define storage interface
export interface IStorage {
  // User methods - enhanced for full user account system
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  updateLastLogin(id: number): Promise<void>;
  
  // Image methods
  createImage(image: InsertImage): Promise<Image>;
  getImage(id: number): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
  getImagesByBatchId(batchId: number): Promise<Image[]>;
  getImagesByUserId(userId: number): Promise<Image[]>;
  
  // Image batch methods
  createImageBatch(batch: InsertImageBatch): Promise<ImageBatch>;
  getImageBatch(id: number): Promise<ImageBatch | undefined>;
  getAllImageBatches(): Promise<ImageBatch[]>;
  getImageBatchesByUserId(userId: number): Promise<ImageBatch[]>;

  // Reddit URL methods
  createRedditUrl(url: InsertRedditUrl): Promise<any>;
  getRedditUrl(id: number): Promise<any | undefined>;
  getAllRedditUrls(): Promise<any[]>;

  // Reddit organic positions methods
  createRedditOrganicPosition(position: InsertRedditOrganicPosition): Promise<RedditOrganicPosition>;
  getRedditOrganicPosition(id: number): Promise<RedditOrganicPosition | undefined>;
  getRedditOrganicPositionsByUserId(userId: number): Promise<RedditOrganicPosition[]>;
  deleteRedditOrganicPositions(ids: number[]): Promise<void>;
  bulkCreateRedditOrganicPositions(positions: InsertRedditOrganicPosition[]): Promise<RedditOrganicPosition[]>;

  // Calendar connection methods
  createCalendarConnection(connection: InsertCalendarConnection): Promise<CalendarConnection>;
  getCalendarConnection(id: number): Promise<CalendarConnection | undefined>;
  getCalendarConnectionsByUserId(userId: number): Promise<CalendarConnection[]>;
  updateCalendarConnection(id: number, data: Partial<InsertCalendarConnection>): Promise<CalendarConnection>;
  deleteCalendarConnection(id: number): Promise<void>;

  // Calendar event methods
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]>;
  updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<void>;
  deleteEventsByConnectionId(connectionId: number): Promise<void>;
  upsertCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
}

// Database implementation of storage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        // Add timestamp for updates
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({
        last_login: new Date()
      })
      .where(eq(users.id, id));
  }
  
  async getImagesByUserId(userId: number): Promise<Image[]> {
    // For now, we'll just return all images since we don't have a user_id column
    // This will be updated when we add user_id to the images table
    return await this.getAllImages();
  }
  
  async getImageBatchesByUserId(userId: number): Promise<ImageBatch[]> {
    // For now, we'll just return all batches since we don't have a user_id column
    // This will be updated when we add user_id to the image_batches table
    return await this.getAllImageBatches();
  }
  
  // Image methods
  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values(insertImage)
      .returning();
    return image;
  }
  
  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }
  
  async getAllImages(): Promise<Image[]> {
    return await db.select().from(images);
  }
  
  async getImagesByBatchId(batchId: number): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(eq(images.rel_img_batch_id, batchId));
  }
  
  // Image batch methods
  async createImageBatch(insertBatch: InsertImageBatch): Promise<ImageBatch> {
    const [batch] = await db
      .insert(image_batches)
      .values(insertBatch)
      .returning();
    return batch;
  }
  
  async getImageBatch(id: number): Promise<ImageBatch | undefined> {
    const [batch] = await db.select().from(image_batches).where(eq(image_batches.id, id));
    return batch || undefined;
  }
  
  async getAllImageBatches(): Promise<ImageBatch[]> {
    return await db.select().from(image_batches);
  }

  // Reddit URL methods
  async createRedditUrl(insertUrl: InsertRedditUrl): Promise<any> {
    const [url] = await db
      .insert(reddit_urls1)
      .values(insertUrl)
      .returning();
    return url;
  }

  async getRedditUrl(id: number): Promise<any | undefined> {
    const [url] = await db.select().from(reddit_urls1).where(eq(reddit_urls1.id, id));
    return url || undefined;
  }

  async getAllRedditUrls(): Promise<any[]> {
    return await db.select().from(reddit_urls1);
  }

  async createRedditOrganicPosition(insertPosition: InsertRedditOrganicPosition): Promise<RedditOrganicPosition> {
    const [position] = await db
      .insert(reddit_organic_positions)
      .values(insertPosition)
      .returning();
    return position;
  }

  async getRedditOrganicPosition(id: number): Promise<RedditOrganicPosition | undefined> {
    const [position] = await db
      .select()
      .from(reddit_organic_positions)
      .where(eq(reddit_organic_positions.id, id));
    return position;
  }

  async getRedditOrganicPositionsByUserId(userId: number): Promise<RedditOrganicPosition[]> {
    const positions = await db
      .select()
      .from(reddit_organic_positions)
      .where(eq(reddit_organic_positions.user_id, userId))
      .orderBy(desc(reddit_organic_positions.created_at));
    return positions;
  }

  async deleteRedditOrganicPositions(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    
    for (const id of ids) {
      await db
        .delete(reddit_organic_positions)
        .where(eq(reddit_organic_positions.id, id));
    }
  }

  async bulkCreateRedditOrganicPositions(positions: InsertRedditOrganicPosition[]): Promise<RedditOrganicPosition[]> {
    if (positions.length === 0) return [];
    
    const createdPositions = await db
      .insert(reddit_organic_positions)
      .values(positions)
      .returning();
    return createdPositions;
  }

  // Calendar connection methods
  async createCalendarConnection(connection: InsertCalendarConnection): Promise<CalendarConnection> {
    const [result] = await db.insert(calendar_connections).values(connection).returning();
    return result;
  }

  async getCalendarConnection(id: number): Promise<CalendarConnection | undefined> {
    const [connection] = await db.select().from(calendar_connections).where(eq(calendar_connections.id, id));
    return connection;
  }

  async getCalendarConnectionsByUserId(userId: number): Promise<CalendarConnection[]> {
    return await db.select().from(calendar_connections).where(eq(calendar_connections.user_id, userId));
  }

  async updateCalendarConnection(id: number, data: Partial<InsertCalendarConnection>): Promise<CalendarConnection> {
    const [result] = await db.update(calendar_connections)
      .set({ ...data, updated_at: new Date() })
      .where(eq(calendar_connections.id, id))
      .returning();
    return result;
  }

  async deleteCalendarConnection(id: number): Promise<void> {
    await db.delete(calendar_connections).where(eq(calendar_connections.id, id));
  }

  // Calendar event methods
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [result] = await db.insert(calendar_events).values(event).returning();
    return result;
  }

  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendar_events).where(eq(calendar_events.id, id));
    return event;
  }

  async getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]> {
    return await db.select().from(calendar_events)
      .where(eq(calendar_events.user_id, userId))
      .orderBy(desc(calendar_events.start_date));
  }

  async updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [result] = await db.update(calendar_events)
      .set({ ...data, updated_at: new Date() })
      .where(eq(calendar_events.id, id))
      .returning();
    return result;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendar_events).where(eq(calendar_events.id, id));
  }

  async deleteEventsByConnectionId(connectionId: number): Promise<void> {
    await db.delete(calendar_events).where(eq(calendar_events.connection_id, connectionId));
  }

  async upsertCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    // Try to find existing event by external_event_id and connection_id
    const [existing] = await db.select().from(calendar_events)
      .where(and(
        eq(calendar_events.external_event_id, event.external_event_id),
        eq(calendar_events.connection_id, event.connection_id)
      ));

    if (existing) {
      // Update existing event
      const [updated] = await db.update(calendar_events)
        .set({ ...event, updated_at: new Date(), last_synced: new Date() })
        .where(eq(calendar_events.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new event
      const [created] = await db.insert(calendar_events).values(event).returning();
      return created;
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();
