import { 
  images, 
  image_batches, 
  reddit_urls1,
  type Image, 
  type ImageBatch, 
  type InsertImage, 
  type InsertImageBatch,
  type InsertRedditUrl,
  users, 
  type User, 
  type InsertUser 
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

// Define storage interface
export interface IStorage {
  // User methods (kept from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image methods
  createImage(image: InsertImage): Promise<Image>;
  getImage(id: number): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
  getImagesByBatchId(batchId: number): Promise<Image[]>;
  
  // Image batch methods
  createImageBatch(batch: InsertImageBatch): Promise<ImageBatch>;
  getImageBatch(id: number): Promise<ImageBatch | undefined>;
  getAllImageBatches(): Promise<ImageBatch[]>;

  // Reddit URL methods
  createRedditUrl(url: InsertRedditUrl): Promise<any>;
  getRedditUrl(id: number): Promise<any | undefined>;
  getAllRedditUrls(): Promise<any[]>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
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
}

// Use database storage
export const storage = new DatabaseStorage();
