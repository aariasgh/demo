import { useQuery } from '@tanstack/react-query';
import client from '../services/api';
import type { Lead, ApiResponse } from '../types';
import { queryKeys } from '../utils/queryKeys';

export const useLeads = () =>
  useQuery({
    queryKey: queryKeys.list(),
    queryFn: async () => {
      const response = await client.get<ApiResponse<Lead[]>>('/leads');
      // Validate response structure
      if (!response?.data?.data || !Array.isArray(response.data.data)) {
        console.error('[useLeads] Invalid response format:', response);
        return [];
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useSearchLeads = (query: string) => {
  // Create AbortController to cancel previous requests if query changes
  const searchController = new AbortController();

  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: async () => {
      try {
        const response = await client.get<ApiResponse<Lead[]>>('/leads/search', {
          params: { q: query },
          signal: searchController.signal,
        });
        // Validate response structure
        if (!response?.data?.data || !Array.isArray(response.data.data)) {
          console.error('[useSearchLeads] Invalid response format:', response);
          return [];
        }
        return response.data.data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was cancelled, return previous data
          return [];
        }
        throw error;
      }
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLeadTimeline = (leadId: number) =>
  useQuery({
    queryKey: queryKeys.timeline(leadId),
    queryFn: async () => {
      const response = await client.get<ApiResponse<Lead[]>>(
        `/leads/${leadId}/timeline`
      );
      // Validate response structure
      if (!response?.data?.data || !Array.isArray(response.data.data)) {
        console.error('[useLeadTimeline] Invalid response format:', response);
        return [];
      }
      return response.data.data;
    },
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
