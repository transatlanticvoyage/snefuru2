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
    // Try Bearer token authentication first
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract the token
      const token = authHeader.split(' ')[1];
      
      // Verify the token
      const payload = verifySessionToken(token);
      
      if (payload) {
        // Add user info to request
        req.user = {
          id: payload.userId
        };
        return next();
      }
    }
    
    // Try cookie-based authentication - check multiple possible cookie names
    const sessionToken = req.cookies?.sessionToken || req.cookies?.token || req.cookies?.authToken;
    if (sessionToken) {
      const payload = verifySessionToken(sessionToken);
      
      if (payload) {
        // Add user info to request
        req.user = {
          id: payload.userId
        };
        return next();
      }
    }
    
    // Debug: Log available cookies to understand the issue
    console.log('Available cookies:', Object.keys(req.cookies || {}));
    console.log('Request headers:', req.headers.cookie);
    
    // No valid authentication found
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
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