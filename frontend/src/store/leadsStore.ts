import { create } from 'zustand';

/**
 * DEPRECATED: Server state (leads data) is now managed by TanStack Query.
 * This store is kept for UI-only state like lead selection.
 * For new features, prefer TanStack Query for server state.
 */
interface LeadsState {
  selectedLeadId: number | null;
  selectLead: (id: number | null) => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  selectedLeadId: null,
  selectLead: (id) => set({ selectedLeadId: id }),
}));
