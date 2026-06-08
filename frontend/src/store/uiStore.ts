import { create } from 'zustand';

interface UIState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedLeadIdForEdit: number | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning' | null;
  isLoading: boolean;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (leadId: number) => void;
  closeEditModal: () => void;
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

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (leadId) => set({ isEditModalOpen: true, selectedLeadIdForEdit: leadId }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedLeadIdForEdit: null }),
  showToast: (message, type = 'info', duration = 3000) => {
    set({ toastMessage: message, toastType: type });
    setTimeout(() => set({ toastMessage: null, toastType: null }), duration);
  },
  closeToast: () => set({ toastMessage: null, toastType: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
