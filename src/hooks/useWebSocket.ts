// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setConnectionStatus, updateLiveTick } from '../features/market/slices/marketSlice';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://stream.paisewise.in/v1/ticks';
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
  
  const watchlistRef = useRef<string[]>(watchlist);
  watchlistRef.current = watchlist;

  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    let isSubscribed = true;

    const startHeartbeat = (ws: WebSocket) => {
      stopHeartbeat();
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: 'PING' }));
          } catch (e) {}
        }
      }, HEARTBEAT_INTERVAL);
    };

    const stopHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };

    const connect = () => {
      if (!isSubscribed) return;

      // Don't recreate if already OPEN or CONNECTING
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      dispatch(setConnectionStatus('CONNECTING'));

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) return;
          dispatch(setConnectionStatus('CONNECTED'));
          reconnectAttempts.current = 0;
          startHeartbeat(ws);

          // Send initial watchlist subscriptions
          const currentWatchlist = watchlistRef.current;
          if (currentWatchlist.length > 0) {
            ws.send(JSON.stringify({ action: 'SUBSCRIBE', symbols: currentWatchlist }));
            prevWatchlistRef.current = currentWatchlist;
          }
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PONG') return;

            if (data.symbol) {
              dispatch(updateLiveTick(data));
            }

            if (onTickRef.current) {
              onTickRef.current(data);
            }
          } catch (err) {
            // Ignore bad frames
          }
        };

        ws.onclose = () => {
          stopHeartbeat();
          if (!isSubscribed) return;
          dispatch(setConnectionStatus('DISCONNECTED'));

          if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
            reconnectAttempts.current += 1;
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
        };

        ws.onerror = () => {
          try { ws.close(); } catch (e) {}
        };
      } catch (e) {
        dispatch(setConnectionStatus('DISCONNECTED'));
      }
    };

    connect();

    return () => {
      isSubscribed = false;
      stopHeartbeat();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (e) {}
        wsRef.current = null;
      }
    };
  }, [dispatch]); // Stable dependency - runs ONLY ONCE on mount!

  // Dynamic Watchlist Subscriptions without socket teardowns
  const watchlistKey = watchlist.join(',');
  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const currentWS = wsRef.current;
    const prev = prevWatchlistRef.current;

    const added = watchlist.filter((s) => !prev.includes(s));
    const removed = prev.filter((s) => !watchlist.includes(s));

    if (added.length > 0) {
      try { currentWS.send(JSON.stringify({ action: 'SUBSCRIBE', symbols: added })); } catch (e) {}
    }
    if (removed.length > 0) {
      try { currentWS.send(JSON.stringify({ action: 'UNSUBSCRIBE', symbols: removed })); } catch (e) {}
    }

    prevWatchlistRef.current = watchlist;
  }, [watchlistKey]);
}