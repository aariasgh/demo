import { create } from 'zustand';
import type { Lead } from '../types/lead';

interface UIState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedLeadIdForEdit: number | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning' | null;
  isLoading: boolean;

  // E6-S4 Phase 4: Action Shortcuts
  isNotesModalOpen: boolean;
  isStatusModalOpen: boolean;
  showRiskWidget: boolean;
  selectedLeadIdForStatus: number | null;
  selectedLeadCurrentStatus: string | null;
  
  // E6-S4 Phase 3: Keyboard Navigation - Track currently focused lead
  focusedLead: Lead | null;
  setFocusedLead: (lead: Lead | null) => void;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (leadId: number) => void;
  closeEditModal: () => void;
  openNotesModal: () => void;
  closeNotesModal: () => void;
  openStatusModal: (leadId: number, currentStatus: string) => void;
  closeStatusModal: () => void;
  toggleRiskWidget: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
  closeToast: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateModalOpen: false,
  isEditModalOpen: false,
  selectedLeadIdForEdit: null,
  toastMessage: null,
  toastType: null,
  isLoading: false,
  isNotesModalOpen: false,
  isStatusModalOpen: false,
  showRiskWidget: false,
  selectedLeadIdForStatus: null,
  selectedLeadCurrentStatus: null,

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (leadId) => set({ isEditModalOpen: true, selectedLeadIdForEdit: leadId }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedLeadIdForEdit: null }),
  openNotesModal: () => set({ isNotesModalOpen: true }),
  closeNotesModal: () => set({ isNotesModalOpen: false }),
  openStatusModal: (leadId, currentStatus) => set({ isStatusModalOpen: true, selectedLeadIdForStatus: leadId, selectedLeadCurrentStatus: currentStatus }),
  closeStatusModal: () => set({ isStatusModalOpen: false, selectedLeadIdForStatus: null, selectedLeadCurrentStatus: null }),
  toggleRiskWidget: () => set((state) => ({ showRiskWidget: !state.showRiskWidget })),
  showToast: (message, type = 'info', duration = 3000) => {
    set({ toastMessage: message, toastType: type });
    setTimeout(() => set({ toastMessage: null, toastType: null }), duration);
  },
  closeToast: () => set({ toastMessage: null, toastType: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  focusedLead: null,
  setFocusedLead: (lead) => set({ focusedLead: lead }),
}));
