import type { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

// ===========================================
// Socket.io Server Setup
// ===========================================

let io: Server;

export const initializeSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // -----------------------------------------
  // Authentication Middleware
  // -----------------------------------------
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
      };
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // -----------------------------------------
  // Connection Handler
  // -----------------------------------------
  io.on("connection", (socket) => {
    const userId = socket.data.user.userId;
    logger.info({ userId, socketId: socket.id }, "Client connected");

    // Join user's personal room (for notifications)
    socket.join(`user:${userId}`);

    // ----- Board Room Management -----
    socket.on("board:join", (boardId: string) => {
      socket.join(`board:${boardId}`);
      logger.debug({ userId, boardId }, "Joined board room");

      // Notify others on the board
      socket.to(`board:${boardId}`).emit("board:user_joined", {
        userId,
        timestamp: new Date(),
      });
    });

    socket.on("board:leave", (boardId: string) => {
      socket.leave(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit("board:user_left", {
        userId,
        timestamp: new Date(),
      });
    });

    // ----- Task Events -----
    socket.on("task:move", (data) => {
      socket.to(`board:${data.boardId}`).emit("task:moved", {
        ...data,
        movedBy: userId,
      });
    });

    socket.on("task:update", (data) => {
      socket.to(`board:${data.boardId}`).emit("task:updated", {
        ...data,
        updatedBy: userId,
      });
    });

    // ----- Presence -----
    socket.on("presence:typing", (data) => {
      socket.to(`board:${data.boardId}`).emit("presence:user_typing", {
        userId,
        taskId: data.taskId,
      });
    });

    // ----- Disconnect -----
    socket.on("disconnect", (reason) => {
      logger.info({ userId, socketId: socket.id, reason }, "Client disconnected");
    });
  });

  logger.info("Socket.io initialized");
  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
