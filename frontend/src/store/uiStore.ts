import { create } from 'zustand';

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

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (leadId: number) => void;
  closeEditModal: () => void;
  openNotesModal: () => void;
  closeNotesModal: () => void;
  openStatusModal: () => void;
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

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (leadId) => set({ isEditModalOpen: true, selectedLeadIdForEdit: leadId }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedLeadIdForEdit: null }),
  openNotesModal: () => set({ isNotesModalOpen: true }),
  closeNotesModal: () => set({ isNotesModalOpen: false }),
  openStatusModal: () => set({ isStatusModalOpen: true }),
  closeStatusModal: () => set({ isStatusModalOpen: false }),
  toggleRiskWidget: () => set((state) => ({ showRiskWidget: !state.showRiskWidget })),
  showToast: (message, type = 'info', duration = 3000) => {
    set({ toastMessage: message, toastType: type });
    setTimeout(() => set({ toastMessage: null, toastType: null }), duration);
  },
  closeToast: () => set({ toastMessage: null, toastType: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
