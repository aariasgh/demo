/**
 * LeadsAtRiskPanel - Slide-out panel showing detailed list of at-risk leads
 * Displays: name, company, status, days_without_change
 * Clickable rows to open lead details
 * Features:
 * - AC-3.3: Opens when widget is clicked
 * - AC-3.4: Shows lead details (name, company, status, days_without_change)
 * - AC-5.3: Includes close button and overlay
 * - PHASE 5: Retry logic, toast notifications, skeleton loaders, timezone handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Lead } from '../types/lead';
import { toastNotifier } from '../utils/toastNotifier';
import { fetchWithRetry, classifyError } from '../utils/apiErrorHandling';
import { formatDuration } from '../utils/timezone';
import { SkeletonPanelLoader } from './SkeletonLoaders';

interface AtRiskLead extends Lead {
  days_without_change: number;
}

interface LeadsAtRiskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLead: (lead: Lead) => void;
}

export default function LeadsAtRiskPanel({ 
  isOpen, 
  onClose, 
  onSelectLead 
}: LeadsAtRiskPanelProps) {
  const [atRiskLeads, setAtRiskLeads] = useState<AtRiskLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isMountedRef = useRef(true);

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
      setRetryCount(0);

      // Toast on successful load after error
      if (retryCount > 0) {
        toastNotifier.success('Leads cargados correctamente');
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const apiError = classifyError(err, undefined);
      console.error('Error fetching at-risk leads:', apiError);
      setError(apiError.message);

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

  // Fetch when panel opens
  useEffect(() => {
    isMountedRef.current = true;

    if (isOpen) {
      fetchAtRiskLeads();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isOpen, fetchAtRiskLeads]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay (AC-5.3) */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            ⚠️ Leads en Riesgo ({atRiskLeads.length})
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <SkeletonPanelLoader />
          )}

          {error && !isLoading && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm font-medium mb-2">Error al cargar</p>
              <p className="text-red-600 text-xs mb-3">{error}</p>
              <button
                onClick={handleRetry}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {atRiskLeads.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-gray-600">Todos en día</p>
                <p className="text-sm text-gray-500 mt-1">No hay leads en riesgo</p>
              </div>
            </div>
          )}

          {/* List of at-risk leads (AC-3.4) */}
          {atRiskLeads.length > 0 && (
            <div className="divide-y divide-gray-200">
              {atRiskLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    onSelectLead(lead);
                    onClose();
                  }}
                  className="p-4 hover:bg-red-50 cursor-pointer transition-colors border-l-4 border-red-600"
                >
                  {/* Lead name - prominent */}
                  <p className="font-semibold text-gray-900 mb-1">{lead.name}</p>
                  
                  {/* Company */}
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Empresa:</span> {lead.company}
                  </p>
                  
                  {/* Status + Days without change */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {lead.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {formatDuration(lead.days_without_change)}
                      </p>
                      <p className="text-xs text-gray-500">sin cambios</p>
                    </div>
                  </div>
                  
                  {/* Email if available */}
                  {lead.email && (
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {lead.email}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Se actualiza automáticamente cada 5 minutos
          </p>
        </div>
      </div>
    </>
  );
}
