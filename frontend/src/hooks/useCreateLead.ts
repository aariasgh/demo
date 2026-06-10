/**
 * useCreateLead Hook
 * Custom hook for creating leads via API using TanStack Query
 * 
 * Features:
 * - Mutation with error handling
 * - Retry logic with exponential backoff
 * - Toast notifications
 * - Query invalidation on success
 * - Type-safe API integration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/uiStore';
import type { LeadCreate, Lead } from '../types/index';

interface CreateLeadResponse {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * API call to create a lead
 */
const createLeadAPI = async (data: LeadCreate): Promise<CreateLeadResponse> => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;
    try {
      const error = await response.json();
      if (error && typeof error === 'object') {
        errorMessage = error.message || error.detail || errorMessage;
      }
    } catch (parseError) {
      console.debug('Failed to parse error response:', parseError);
    }
    
    const customError = new Error(errorMessage);
    (customError as any).status = response.status;
    throw customError;
  }

  const responseData = await response.json();
  if (!responseData) {
    throw new Error('Empty response from server');
  }
  return responseData as Promise<CreateLeadResponse>;
};

/**
 * Determine if an error should be retried
 * Non-retryable client errors (409, 422) should not be retried
 */
const shouldRetry = (failureCount: number, error: Error): boolean => {
  if (failureCount > 2) return false;
  const status = (error as any).status;
  return status !== 409 && status !== 422;
};

/**
 * useCreateLead Hook
 * Returns mutation functions and state for creating a lead
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: createLeadAPI,
    retry: shouldRetry,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData(['leads']);
      return { previousLeads };
    },
    onSuccess: (lead: CreateLeadResponse) => {
      // Update leads query with new lead
      queryClient.setQueryData(['leads'], (old: Lead[] | undefined) => {
        if (!old) return [lead as Lead];
        return [...old, lead as Lead];
      });

      // Show success toast
      showToast(`✓ Lead '${lead.name}' creado exitosamente`, 'success', 3000);
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }

      // Classify error by HTTP status code
      const status = (error as any).status;
      let errorMessage = error.message || 'Error al crear lead';

      if (status === 409) {
        errorMessage = 'El email ya existe';
      } else if (status === 422) {
        errorMessage = 'Datos inválidos';
      } else if (status === 500) {
        errorMessage = 'Error del servidor. Intenta de nuevo';
      }

      // Show error toast
      showToast(errorMessage, 'error', 5000);
    },
  });
};

export default useCreateLead;
