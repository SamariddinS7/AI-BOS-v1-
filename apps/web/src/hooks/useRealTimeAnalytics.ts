import { useState, useEffect, useRef } from 'react';

export interface AnalyticsUpdate {
  type: 'analytics_update' | 'anomaly_detected' | 'system_alert';
  module: string;
  data: any;
  timestamp: string;
}

export function useRealTimeAnalytics() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<AnalyticsUpdate | null>(null);
  const [updates, setUpdates] = useState<AnalyticsUpdate[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Real-time Analytics Stream');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'analytics_update' || message.type === 'anomaly_detected' || message.type === 'system_alert') {
            setLastUpdate(message);
            setUpdates(prev => [message, ...prev].slice(0, 50)); // Keep last 50 updates
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from Real-time Analytics Stream');
        setIsConnected(false);
        // Reconnect after 5 seconds
        setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.warn('WebSocket connection issue (expected in some environments):', error);
        ws.close();
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected, lastUpdate, updates };
}
