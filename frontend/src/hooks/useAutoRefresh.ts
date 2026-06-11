/**
 * useAutoRefresh Hook
 * Manages auto-refresh interval for at-risk leads
 * Coordinates between Widget and Panel for consistent data
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  intervalMs?: number;
  onRefresh: () => Promise<void>;
  enabled?: boolean;
}

export function useAutoRefresh({
  intervalMs = 5 * 60 * 1000, // 5 minutes default
  onRefresh,
  enabled = true,
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const startRefreshInterval = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!enabled || intervalMs <= 0) {
      return;
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        console.debug(
          '[useAutoRefresh] Trigger at',
          new Date().toISOString(),
          `(interval: ${intervalMs}ms)`
        );
        onRefresh();
      }
    }, intervalMs);
  }, [intervalMs, onRefresh, enabled]);

  const stopRefreshInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Setup interval on mount
  useEffect(() => {
    isMountedRef.current = true;
    startRefreshInterval();

    return () => {
      isMountedRef.current = false;
      stopRefreshInterval();
    };
  }, [startRefreshInterval, stopRefreshInterval]);

  return {
    isActive: !!intervalRef.current && enabled,
    stop: stopRefreshInterval,
    start: startRefreshInterval,
  };
}
