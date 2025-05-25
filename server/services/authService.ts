/**
 * Authentication service for user management
 */
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { storage } from '../storage';
import { users, type User, type InsertUser } from '@shared/schema';

// Generate a random salt
function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash password with salt using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || generateSalt();
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

// Verify password against stored hash
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

// Register a new user
export async function registerUser(userData: {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);
    
    if (existingUserByEmail.length > 0) {
      throw new Error('Email already in use');
    }
    
    const existingUserByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1);
    
    if (existingUserByUsername.length > 0) {
      throw new Error('Username already taken');
    }
    
    // Hash the password
    const { hash, salt } = hashPassword(userData.password);
    
    // Add salt to the password field (format: "hash:salt")
    const hashedPassword = `${hash}:${salt}`;
    
    // Create the new user
    const user = await storage.createUser({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
    });
    
    // Return the user without the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Login a user
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{ user: Omit<User, 'password'>, token: string } | null> {
  try {
    // Find the user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, credentials.email))
      .limit(1);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Extract hash and salt from stored password
    const [hash, salt] = user.password.split(':');
    
    // Verify password
    if (!verifyPassword(credentials.password, hash, salt)) {
      throw new Error('Invalid email or password');
    }
    
    // Update last login timestamp
    await db
      .update(users)
      .set({ last_login: new Date() })
      .where(eq(users.id, user.id));
    
    // Generate a session token
    const token = generateSessionToken(user.id);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as Omit<User, 'password'>,
      token
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Generate a session token
function generateSessionToken(userId: number): string {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours expiration
    iat: Math.floor(Date.now() / 1000)
  };
  
  // In a real app, you'd use a proper JWT library with a secret key
  // For this example, we'll just stringify and base64 encode the payload
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify a session token
export function verifySessionToken(token: string): { userId: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return { userId: payload.userId };
  } catch (error) {
    return null;
  }
}