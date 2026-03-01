import { io, Socket } from 'socket.io-client';
import type { MetricsPacket } from '@/features/detection/telemetry/metrics.types';

// Type definitions for Socket.IO events
export interface EyeStatePayload {
  eyes_open: boolean;
  confidence: number;
  timestamp: number;
}

export interface AlarmDismissedPayload {
  timestamp: number;
}

interface ServerToClientEvents {
  eye_state: (payload: EyeStatePayload) => void;
  alarm_dismissed: (payload: AlarmDismissedPayload) => void;
  metrics: (payload: MetricsPacket) => void;
}

interface ClientToServerEvents {
  override_th: (payload: { threshold: number }) => void;
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(url: string = `http://${window.location.host}`): void {
    if (this.socket?.connected) return;

    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onEyeState(callback: (payload: EyeStatePayload) => void): void {
    this.socket?.on('eye_state', callback);
  }

  onAlarmDismissed(callback: (payload: AlarmDismissedPayload) => void): void {
    this.socket?.on('alarm_dismissed', callback);
  }

  onMetrics(callback: (payload: MetricsPacket) => void): void {
    this.socket?.on('metrics', callback);
  }

  emitOverrideTh(threshold: number): void {
    this.socket?.emit('override_th', { threshold });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = SocketService.getInstance();
