// frontend/src/hooks/useTimelineEvents.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import type { TimelineListResponse, TimelineEventCreate } from '../types/timeline';

export function useTimelineEvents(leadId: number, eventType?: string) {
  return useQuery<TimelineListResponse>({
    queryKey: ['timeline', leadId, eventType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventType) params.append('event_type', eventType);
      const response = await apiClient.get(
        `/api/leads/${leadId}/timeline?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    enabled: leadId > 0,
  });
}

export function useAddTimelineEvent(leadId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TimelineEventCreate) => {
      return apiClient.post(`/api/leads/${leadId}/timeline`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', leadId] });
    },
  });
}

export function useDeleteTimelineEvent(leadId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      return apiClient.delete(`/api/leads/${leadId}/timeline/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', leadId] });
    },
  });
}
