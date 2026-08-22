// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setConnectionStatus, updateLiveTick } from '../features/market/slices/marketSlice';

 const WS_URL = process.env.REACT_APP_WS_URL || 'wss://ws.example.com/ticks';
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useWebSocket(watchlist: string[], onTick?: (tick: any) => void) {
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevWatchlistRef = useRef<string[]>([]);

  const startHeartbeat = (ws: WebSocket) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const connect = useCallback(() => {
    dispatch(setConnectionStatus('CONNECTING'));
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      dispatch(setConnectionStatus('CONNECTED'));
      reconnectAttempts.current = 0;
      startHeartbeat(ws);

      // Send initial watchlist subscriptions
      if (watchlist.length > 0) {
        ws.send(JSON.stringify({ action: 'SUBSCRIBE', symbols: watchlist }));
        prevWatchlistRef.current = watchlist;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PONG') return; // Ignore heartbeat acknowledgement

        // Automatically store/update tick in Redux state for useLiveTick hook
        if (data.symbol) {
          dispatch(updateLiveTick(data));
        }

        // Trigger optional callback if passed
        if (onTick) {
          onTick(data);
        }
      } catch (err) {
        console.error('Failed to parse incoming WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      stopHeartbeat();
      dispatch(setConnectionStatus('DISCONNECTED'));

      // Exponential backoff reconnect strategy
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
        reconnectAttempts.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket encountered an error:', error);
      ws.close();
    };
  }, [watchlist, onTick, dispatch]);

  // Establish connection on mount and cleanup on unmount
  useEffect(() => {
    connect();
    return () => {
      stopHeartbeat();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Handle dynamic watchlist additions/removals while connected
  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const currentWS = wsRef.current;
    const prev = prevWatchlistRef.current;

    const added = watchlist.filter((s) => !prev.includes(s));
    const removed = prev.filter((s) => !watchlist.includes(s));

    if (added.length > 0) {
      currentWS.send(JSON.stringify({ action: 'SUBSCRIBE', symbols: added }));
    }
    if (removed.length > 0) {
      currentWS.send(JSON.stringify({ action: 'UNSUBSCRIBE', symbols: removed }));
    }

    prevWatchlistRef.current = watchlist;
  }, [watchlist]);
}