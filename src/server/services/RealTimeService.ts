import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface SocketUser {
  id: string;
  email: string;
  role: string;
}

export class RealTimeService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://community-events-frontend-m9ue.onrender.com']
          : ['http://localhost:3001', 'http://localhost:3000'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('Socket.IO server initialized');
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        socket.data.user = decoded;
        
        logger.debug('Socket authenticated', { 
          userId: decoded.userId,
          socketId: socket.id 
        });
        
        next();
      } catch (error) {
        logger.warn('Socket authentication failed', { 
          error: (error as Error).message,
          socketId: socket.id 
        });
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      
      // Track connected user
      if (!this.connectedUsers.has(user.userId)) {
        this.connectedUsers.set(user.userId, new Set());
      }
      this.connectedUsers.get(user.userId)!.add(socket.id);

      logger.info('User connected', { 
        userId: user.userId,
        socketId: socket.id,
        totalConnections: this.io.engine.clientsCount
      });

      // Join user to their personal room
      socket.join(`user:${user.userId}`);

      // Handle event subscriptions
      socket.on('subscribe:event', (eventId: string) => {
        socket.join(`event:${eventId}`);
        logger.debug('User subscribed to event', { 
          userId: user.userId,
          eventId,
          socketId: socket.id 
        });
      });

      socket.on('unsubscribe:event', (eventId: string) => {
        socket.leave(`event:${eventId}`);
        logger.debug('User unsubscribed from event', { 
          userId: user.userId,
          eventId,
          socketId: socket.id 
        });
      });

      // Handle organizer rooms
      if (user.role === 'organizer' || user.role === 'admin') {
        socket.join('organizers');
      }

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        // Remove from connected users
        const userSockets = this.connectedUsers.get(user.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(user.userId);
          }
        }

        logger.info('User disconnected', { 
          userId: user.userId,
          socketId: socket.id,
          reason,
          totalConnections: this.io.engine.clientsCount
        });
      });
    });
  }

  // Event-related real-time updates
  notifyEventUpdate(eventId: string, update: any) {
    this.io.to(`event:${eventId}`).emit('event:updated', {
      eventId,
      ...update,
      timestamp: new Date().toISOString()
    });

    logger.debug('Event update broadcasted', { eventId, update });
  }

  notifyEventCapacityChange(eventId: string, capacity: { current: number; max: number }) {
    this.io.to(`event:${eventId}`).emit('event:capacity_changed', {
      eventId,
      capacity,
      timestamp: new Date().toISOString()
    });

    logger.debug('Event capacity change broadcasted', { eventId, capacity });
  }

  notifyNewRegistration(eventId: string, registration: any) {
    // Notify event subscribers
    this.io.to(`event:${eventId}`).emit('event:new_registration', {
      eventId,
      registration,
      timestamp: new Date().toISOString()
    });

    // Notify organizers
    this.io.to('organizers').emit('organizer:new_registration', {
      eventId,
      registration,
      timestamp: new Date().toISOString()
    });

    logger.debug('New registration broadcasted', { eventId, registrationId: registration.id });
  }

  notifyEventCancellation(eventId: string, reason: string) {
    this.io.to(`event:${eventId}`).emit('event:cancelled', {
      eventId,
      reason,
      timestamp: new Date().toISOString()
    });

    logger.info('Event cancellation broadcasted', { eventId, reason });
  }

  // User-specific notifications
  notifyUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });

    logger.debug('User notification sent', { userId, notification });
  }

  // Payment-related notifications
  notifyPaymentSuccess(userId: string, paymentData: any) {
    this.io.to(`user:${userId}`).emit('payment:success', {
      ...paymentData,
      timestamp: new Date().toISOString()
    });

    logger.info('Payment success notification sent', { userId, paymentId: paymentData.id });
  }

  notifyPaymentFailure(userId: string, paymentData: any) {
    this.io.to(`user:${userId}`).emit('payment:failed', {
      ...paymentData,
      timestamp: new Date().toISOString()
    });

    logger.warn('Payment failure notification sent', { userId, paymentId: paymentData.id });
  }

  // Admin notifications
  notifyAdmins(notification: any) {
    this.io.to('organizers').emit('admin:notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });

    logger.info('Admin notification broadcasted', { notification });
  }

  // Get connection stats
  getConnectionStats() {
    return {
      totalConnections: this.io.engine.clientsCount,
      connectedUsers: this.connectedUsers.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys())
    };
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }
}