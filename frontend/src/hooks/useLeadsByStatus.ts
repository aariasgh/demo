/**
 * Custom hook to fetch and group leads by status
 * Used by KanbanBoard to render columns
 */

import { useMemo } from 'react';
import { useLeads } from './useLeads';
import type { Lead } from '../types';

interface LeadsByStatus {
  "Nuevo": Lead[];
  "En contacto": Lead[];
  "Propuesta enviada": Lead[];
  "Cerrado": Lead[];
}

export const useLeadsByStatus = () => {
  const { data: leads = [], isLoading, error } = useLeads();

  const groupedLeads = useMemo(() => {
    const grouped: LeadsByStatus = {
      "Nuevo": [],
      "En contacto": [],
      "Propuesta enviada": [],
      "Cerrado": [],
    };

    leads.forEach((lead) => {
      const status = lead.status as keyof LeadsByStatus;
      if (status in grouped) {
        grouped[status].push(lead);
      } else {
        console.warn(`Invalid status value: "${lead.status}" for lead ID: ${lead.id}`);
      }
    });

    return grouped;
  }, [leads]);

  return {
    groupedLeads,
    isLoading,
    error,
    totalLeads: leads.length,
  };
};
