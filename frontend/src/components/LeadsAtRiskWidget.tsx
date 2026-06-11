/**
 * LeadsAtRiskWidget - Dashboard widget showing leads at risk
 * Displays count of leads without status change for 7+ days
 * Clickable to open detailed panel
 * Features:
 * - AC-3.1: Widget appears in dashboard
 * - AC-3.2: Shows count badge: "⚠️ X Leads en Riesgo"
 * - AC-3.3: Clickable to open panel
 * - AC-6.3: Auto-refreshes every 5 minutes
 * - PHASE 5: Retry logic, toast notifications, skeleton loaders
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Lead } from '../types/lead';
import { toastNotifier } from '../utils/toastNotifier';
import { fetchWithRetry, classifyError } from '../utils/apiErrorHandling';
import { formatDuration } from '../utils/timezone';
import { SkeletonWidgetLoader } from './SkeletonLoaders';

interface AtRiskLead extends Lead {
  days_without_change: number;
}

interface LeadsAtRiskWidgetProps {
  onOpenPanel: () => void;
}

export default function LeadsAtRiskWidget({ onOpenPanel }: LeadsAtRiskWidgetProps) {
  const [atRiskLeads, setAtRiskLeads] = useState<AtRiskLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Fetch at-risk leads from backend with retry logic
  const fetchAtRiskLeads = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchWithRetry('/api/leads/at-risk', {}, {
        maxAttempts: 3,
        baseDelayMs: 500,
        backoffMultiplier: 2,
      });

      if (!isMountedRef.current) return;

      const data = await response.json();
      setAtRiskLeads(data.data || []);
      setRetryCount(0); // Reset retry count on success

      // Toast on load success (only after error recovery)
      if (retryCount > 0) {
        toastNotifier.success('Leads actualizados correctamente');
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const apiError = classifyError(err, undefined);
      console.error('Error fetching at-risk leads:', apiError);
      setError(apiError.message);

      // Show error toast only if not retrying
      if (apiError.isRetryable && retryCount < 3) {
        setRetryCount((prev) => prev + 1);
      } else {
        toastNotifier.error(`Error: ${apiError.message}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [retryCount]);

  // Handle manual retry
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchAtRiskLeads();
  }, [fetchAtRiskLeads]);

  // Fetch on mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchAtRiskLeads();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchAtRiskLeads]);

  // AC-6.3: Auto-refresh every 5 minutes (300000 ms)
  // Phase 5: Enhanced auto-refresh with verification
  useEffect(() => {
    isMountedRef.current = true;

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval (5 minutes = 300000 ms)
    refreshIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        console.debug('[LeadsAtRiskWidget] Auto-refresh triggered at', new Date().toISOString());
        fetchAtRiskLeads();
      }
    }, 5 * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchAtRiskLeads]);

  const count = atRiskLeads.length;

  // Phase 5: Skeleton loader for better UX
  if (isLoading && count === 0) {
    return <SkeletonWidgetLoader />;
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700">Error al cargar leads</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors whitespace-nowrap ml-2"
            aria-label="Reintentar cargar leads"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Zero state: No leads at risk (AC-5.2: Show positive message)
  if (count === 0) {
    return (
      <div 
        onClick={onOpenPanel}
        className="p-4 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <span className="font-medium text-green-700">Todos en día</span>
        </div>
        <p className="text-xs text-green-600 mt-1">No hay leads en riesgo</p>
      </div>
    );
  }

  // At-risk state: Show badge with count
  return (
    <div
      onClick={onOpenPanel}
      className="p-4 bg-red-50 rounded-lg border-2 border-red-300 cursor-pointer hover:bg-red-100 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-pulse">⚠️</span>
          <span className="font-bold text-red-700 text-lg">
            {count} {count === 1 ? 'Lead' : 'Leads'} en Riesgo
          </span>
        </div>
        <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold leading-none text-white transform translate-x-0 bg-red-600 rounded-full">
          {count}
        </span>
      </div>
      
      {/* Show oldest at-risk lead preview with formatted duration */}
      {atRiskLeads.length > 0 && (
        <div className="mt-3 pt-3 border-t border-red-200 text-xs text-red-600">
          <p className="font-medium">
            Más antiguo: {atRiskLeads[0].name} ({formatDuration(atRiskLeads[0].days_without_change)})
          </p>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        {isLoading ? '⏳ Actualizando...' : '✓ Click para detalles • Se actualiza cada 5 min'}
      </p>
    </div>
  );
}
