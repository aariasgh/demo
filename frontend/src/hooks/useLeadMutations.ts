import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../services/api';
import type { Lead, LeadCreate, LeadUpdate, ApiResponse } from '../types';
import { useUIStore } from '../store/uiStore';
import { queryKeys } from '../utils/queryKeys';

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (leadData: LeadCreate) => {
      const response = await client.post<ApiResponse<Lead>>('/leads', leadData);
      return response.data.data;
    },
    onMutate: async (newLead) => {
      // Optimistic update: add to cache immediately
      await queryClient.cancelQueries({ queryKey: queryKeys.list() });
      const previousLeads = queryClient.getQueryData<Lead[]>(queryKeys.list());
      
      queryClient.setQueryData(queryKeys.list(), (old: Lead[] | undefined) => [
        ...(old || []),
        {
          id: -1, // Temporary ID
          ...newLead,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Nuevo',
        } as Lead,
      ]);
      
      return { previousLeads };
    },
    onSuccess: (serverLead) => {
      // Replace optimistic entry with server response
      queryClient.setQueryData(queryKeys.list(), (old: Lead[] | undefined) =>
        (old || []).map(l => l.id === -1 ? serverLead : l)
      );
      showToast('Lead creado exitosamente', 'success');
    },
    onError: (error, _newLead, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(queryKeys.list(), context.previousLeads);
      }
      showToast('Error al crear lead', 'error');
      console.error('Create lead error:', error);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LeadUpdate }) => {
      const response = await client.patch<ApiResponse<Lead>>(`/leads/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      // Granular invalidation: only invalidate list and specific lead detail
      queryClient.invalidateQueries({ queryKey: queryKeys.list(), exact: true });
      showToast('Lead actualizado exitosamente', 'success');
    },
    onError: (error) => {
      showToast('Error al actualizar lead', 'error');
      console.error('Update lead error:', error);
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      // Granular invalidation: only invalidate list
      queryClient.invalidateQueries({ queryKey: queryKeys.list(), exact: true });
      showToast('Lead eliminado exitosamente', 'success');
    },
    onError: (error) => {
      showToast('Error al eliminar lead', 'error');
      console.error('Delete lead error:', error);
    },
  });
};

export const useValidateEmail = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const response = await client.post<ApiResponse<{ valid: boolean }>>(
        '/leads/validate-email',
        { email }
      );
      return response.data.data;
    },
  });
