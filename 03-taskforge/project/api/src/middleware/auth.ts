import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { config } from "../config/index.js";
import { ForbiddenError, UnauthorizedError } from "./errorHandler.js";

// ===========================================
// Type Definitions
// ===========================================

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

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

export const generateAccessToken = (
  payload: Omit<JwtPayload, "iat" | "exp">,
): string =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

export const generateRefreshToken = (
  payload: Omit<JwtPayload, "iat" | "exp">,
): string =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, config.jwt.secret) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;

// ===========================================
// Authentication Middleware
// ===========================================

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedError("No authorization header");
    if (!authHeader.startsWith("Bearer "))
      throw new UnauthorizedError("Invalid format. Use: Bearer <token>");

    const token = authHeader.split(" ")[1];
    if (!token) throw new UnauthorizedError("No token provided");

    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError)
      next(new UnauthorizedError("Invalid token"));
    else if (error instanceof jwt.TokenExpiredError)
      next(new UnauthorizedError("Token expired"));
    else next(error);
  }
};

// ===========================================
// Workspace Role Authorization
// ===========================================
// TaskForge uses per-workspace roles, not global roles.
// Authorization checks are done in services against the
// workspace's members array.
// ===========================================

import { Workspace, type WorkspaceRole } from "../models/index.js";

export const authorizeWorkspaceRole = (
  ...allowedRoles: WorkspaceRole[]
) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) return next(new UnauthorizedError());

      const workspaceId =
        req.params.workspaceId || req.body.workspaceId;
      if (!workspaceId)
        return next(new ForbiddenError("Workspace ID required"));

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace)
        return next(new ForbiddenError("Workspace not found"));

      const member = workspace.members.find(
        (m) => m.userId.toString() === req.user!.userId,
      );
      if (!member)
        return next(new ForbiddenError("Not a member of this workspace"));

      if (!allowedRoles.includes(member.role))
        return next(
          new ForbiddenError(
            `Requires role: ${allowedRoles.join(" or ")}. Your role: ${member.role}`,
          ),
        );

      next();
    } catch (error) {
      next(error);
    }
  };
};
