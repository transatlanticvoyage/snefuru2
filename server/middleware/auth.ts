import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../services/authService';

// Define interface for authenticated request
export interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

// Middleware to protect routes that require authentication
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const payload = verifySessionToken(token);
    
    if (!payload) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Add user info to request
    req.user = {
      id: payload.userId
    };
    
    // Continue to the protected route
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
}

// Middleware to optionally authenticate a user
// Use this for routes that can work with or without authentication
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    // If no auth header, continue without setting user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const payload = verifySessionToken(token);
    
    // If valid token, add user to request
    if (payload) {
      req.user = {
        id: payload.userId
      };
    }
    
    // Continue to the route
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
}