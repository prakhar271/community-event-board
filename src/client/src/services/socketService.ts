import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const token = useAuthStore.getState().token;

    if (!token) {
      console.log('No auth token, skipping socket connection');
      return;
    }

    this.socket = io(API_BASE_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to real-time server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    // Event-specific listeners
    this.socket.on('event:updated', (data) => {
      console.log('📅 Event updated:', data);
      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('eventUpdated', { detail: data }));
    });

    this.socket.on('event:cancelled', (data) => {
      console.log('❌ Event cancelled:', data);
      window.dispatchEvent(new CustomEvent('eventCancelled', { detail: data }));
    });

    this.socket.on('event:capacity_changed', (data) => {
      console.log('👥 Event capacity changed:', data);
      window.dispatchEvent(new CustomEvent('eventCapacityChanged', { detail: data }));
    });

    this.socket.on('payment:success', (data) => {
      console.log('💳 Payment successful:', data);
      window.dispatchEvent(new CustomEvent('paymentSuccess', { detail: data }));
    });

    this.socket.on('payment:failed', (data) => {
      console.log('❌ Payment failed:', data);
      window.dispatchEvent(new CustomEvent('paymentFailed', { detail: data }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  // Join event room for real-time updates
  joinEventRoom(eventId: string) {
    if (this.socket) {
      this.socket.emit('join:event', eventId);
    }
  }

  // Leave event room
  leaveEventRoom(eventId: string) {
    if (this.socket) {
      this.socket.emit('leave:event', eventId);
    }
  }
}

export const socketService = new SocketService();