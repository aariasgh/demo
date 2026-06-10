import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { DropResult } from 'react-beautiful-dnd';

interface DragMutationPayload {
  id: number;
  newStatus: string;
}

const VALID_STATUSES = ['Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'] as const;

export const useKanbanDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for PATCH /api/leads/{id}/status
  const changeStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: DragMutationPayload) =>
      fetch(`/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),

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

    onError: (_err, _vars, context: any) => {
      // Revert on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      toast.error('Error al cambiar estado. Reintentando...');
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

    // Draggable ID format: "lead-{id}"
    const leadId = parseInt(draggableId.split('-')[1], 10);

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

    // Validate status is in the allowed list
    if (!VALID_STATUSES.includes(newStatus as any)) {
      toast.error('Destino inválido');
      return;
    }

    // Disable dragging during sync
    setIsDragging(true);

    // Trigger mutation
    changeStatusMutation.mutate(
      { id: leadId, newStatus },
      {
        onSettled: () => setIsDragging(false),
      }
    );
  };

  return { isDragging, handleDragEnd };
};
