import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { loginSchema, registerSchema, userSettingsSchema } from '@shared/schema';
import { registerUser, loginUser } from '../services/authService';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Register the user
    const user = await registerUser({
      email: validatedData.email,
      username: validatedData.username,
      password: validatedData.password,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
    });
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    // Handle existing user errors
    if (error instanceof Error && error.message.includes('already')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
});

// Login a user
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Login the user
    const result = await loginUser({
      email: validatedData.email,
      password: validatedData.password
    });
    
    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Return success response with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    // Handle invalid credentials
    if (error instanceof Error && error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
});

// Get current user profile
router.get('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get the user from the database
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    // Return the user profile
    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error getting user profile'
    });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Validate request body
    const validatedData = userSettingsSchema.parse(req.body);
    
    // Get the current user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user data
    const updateData: Partial<typeof user> = {};
    
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.username) updateData.username = validatedData.username;
    if (validatedData.first_name) updateData.first_name = validatedData.first_name;
    if (validatedData.last_name) updateData.last_name = validatedData.last_name;
    if (validatedData.profile_image) updateData.profile_image = validatedData.profile_image;
    
    // Handle password change if provided
    if (validatedData.current_password && validatedData.new_password) {
      // Extract hash and salt from stored password
      const [hash, salt] = user.password.split(':');
      
      // Import hashPassword and verifyPassword directly to avoid circular dependencies
      const { hashPassword, verifyPassword } = await import('../services/authService');
      
      // Verify current password
      if (!verifyPassword(validatedData.current_password, hash, salt)) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash the new password
      const { hash: newHash, salt: newSalt } = hashPassword(validatedData.new_password);
      
      // Set the new password
      updateData.password = `${newHash}:${newSalt}`;
    }
    
    // Update the user in the database
    const updatedUser = await storage.updateUser(userId, updateData);
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = updatedUser;
    
    // Return the updated user profile
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
});

export default router;