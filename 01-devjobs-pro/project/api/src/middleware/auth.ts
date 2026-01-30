import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { config } from "../config/index.js";
import { ForbiddenError, UnauthorizedError } from "./errorHandler.js";

// ===========================================
// Type Definitions
// ===========================================

/**
 * User roles in the application
 */
export type UserRole = "candidate" | "employer" | "admin";

/**
 * JWT payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Extend Express Request to include authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ===========================================
// JWT Token Utilities
// ===========================================

/**
 * Generate access token
 */
export const generateAccessToken = (
  payload: Omit<JwtPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (
  payload: Omit<JwtPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};

// ===========================================
// Authentication Middleware
// ===========================================

/**
 * Protect routes - Requires valid JWT token
 *
 * Usage:
 * router.get('/protected', authenticate, controller);
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("No authorization header provided");
    }

    // Check for Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Invalid authorization format. Use: Bearer <token>",
      );
    }

    // Get the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(error);
    }
  }
};

// ===========================================
// Authorization Middleware
// ===========================================

/**
 * Restrict access to specific roles
 *
 * Usage:
 * router.delete('/admin', authenticate, authorize('admin'), controller);
 * router.post('/jobs', authenticate, authorize('employer', 'admin'), controller);
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // User must be authenticated first
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}`,
        ),
      );
    }

    next();
  };
};

// ===========================================
// Optional Authentication Middleware
// ===========================================

/**
 * Optional authentication - Attaches user if token provided, continues if not
 *
 * Usage:
 * router.get('/jobs', optionalAuth, controller);
 * // req.user will be JwtPayload | undefined
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    // Verify token and attach user
    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch {
    // Token invalid or expired, but that's okay for optional auth
    // Just continue without attaching user
    next();
  }
};

// ===========================================
// Resource Ownership Middleware
// ===========================================

/**
 * Verify resource ownership or admin access
 *
 * Usage:
 * router.put('/users/:id', authenticate, isOwnerOrAdmin('id'), controller);
 *
 * @param paramName - The route parameter containing the user ID
 */
export const isOwnerOrAdmin = (paramName: string = "id") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const resourceUserId = req.params[paramName];

    // Allow if user is admin or owns the resource
    if (req.user.role === "admin" || req.user.userId === resourceUserId) {
      return next();
    }

    next(
      new ForbiddenError("You do not have permission to access this resource"),
    );
  };
};
