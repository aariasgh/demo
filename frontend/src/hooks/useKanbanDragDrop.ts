import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { DropResult } from 'react-beautiful-dnd';
import { LEAD_STATUSES, type LeadStatus } from '../utils/constants';

interface DragMutationPayload {
  id: number;
  newStatus: LeadStatus;
}

// Network timeout for drag-drop mutations (5 seconds)
const DRAG_TIMEOUT_MS = 5000;

// Validation for draggable ID format
const DRAGGABLE_ID_PATTERN = /^lead-(\d+)$/;

export const useKanbanDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for PATCH /api/leads/{id}/status
  const changeStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: DragMutationPayload) => {
      // H1.3: Validate status before sending to backend
      if (!LEAD_STATUSES.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      // H2.5: Add AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DRAG_TIMEOUT_MS);

      return fetch(`/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus }),
        signal: controller.signal,
      })
        .then((r) => {
          clearTimeout(timeoutId);
          // H1.2: Differentiate 4xx vs 5xx errors
          if (!r.ok) {
            const statusCode = r.status;
            if (statusCode >= 400 && statusCode < 500) {
              throw new Error(`Client error: ${statusCode}`);
            } else if (statusCode >= 500) {
              throw new Error(`Server error: ${statusCode}`);
            }
            throw new Error(`HTTP error: ${statusCode}`);
          }
          return r.json();
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw err;
        });
    },

    onMutate: async ({ id, newStatus }) => {
      // Cancel ongoing queries to prevent overwriting optimistic updates
      await queryClient.cancelQueries({ queryKey: ['leads'] });

      // Backup previous data for potential rollback
      const previousLeads = queryClient.getQueryData(['leads']);

      // Optimistic update: immediately update the UI
      queryClient.setQueryData(['leads'], (old: any) => ({
        ...old,
        data: old.data.map((lead: any) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        ),
      }));

      return { previousLeads };
    },

    onError: (err, _vars, context: any) => {
      // Revert on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      // H1.2: Provide specific error messages
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        toast.error('Lead no encontrado. Recargando...');
      } else if (errorMsg.includes('422') || errorMsg.includes('Invalid')) {
        toast.error('Estado inválido. Intenta otro cambio.');
      } else if (errorMsg.includes('timeout') || errorMsg.includes('Abort')) {
        toast.error('Conexión lenta. Reintentando...');
      } else {
        toast.error('Error al cambiar estado. Reintentando...');
      }
    },

    onSuccess: (_data, { newStatus }) => {
      toast.success(`Lead movido a "${newStatus}"`);
      // Data already updated optimistically
    },

    retry: (failureCount) => {
      // Allow up to 3 retries
      if (failureCount > 3) return false;
      return true; // Use default exponential backoff (100ms, 200ms, 400ms)
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // H1.1: Validate draggable ID format before parsing
    const idMatch = draggableId.match(DRAGGABLE_ID_PATTERN);
    if (!idMatch || !idMatch[1]) {
      console.error(`Invalid draggable ID format: ${draggableId}`);
      toast.error('Error interno: ID inválido');
      return;
    }
    const leadId = parseInt(idMatch[1], 10);
    if (isNaN(leadId)) {
      console.error(`Failed to parse lead ID from: ${draggableId}`);
      toast.error('Error interno: No se pudo procesar el lead');
      return;
    }

    // No destination: drag cancelled
    if (!destination) {
      return;
    }

    // Same position: no change needed
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Same column = just reorder (no status change, no API call)
    // TODO: Persist reordering in future epic
    if (oldStatus === newStatus) {
      return;
    }

    // H1.3: Validate status before mutation
    if (!LEAD_STATUSES.includes(newStatus as LeadStatus)) {
      console.error(`Invalid status destination: ${newStatus}`);
      toast.error('Destino inválido');
      return;
    }

    // Disable dragging during sync
    setIsDragging(true);

    // Trigger mutation with validated status
    changeStatusMutation.mutate(
      { id: leadId, newStatus: newStatus as LeadStatus },
      {
        onSettled: () => setIsDragging(false),
      }
    );
  };

  // H2.3: AC-7: Export isPending to prevent concurrent drags
  const isPending = changeStatusMutation.isPending;

  return { isDragging, handleDragEnd, isPending };
};
