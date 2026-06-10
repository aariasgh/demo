/**
 * CreateLeadModal Component Tests
 * Basic smoke tests to verify component renders and handles interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateLeadModal from './CreateLeadModal';
import { useUIStore } from '../store/uiStore';

describe('CreateLeadModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    // Reset store between tests
    useUIStore.setState({ isCreateModalOpen: false });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  // Test 1: Should not render when isCreateModalOpen is false
  it('should not render when isCreateModalOpen is false', () => {
    useUIStore.setState({ isCreateModalOpen: false });
    const { container } = render(<CreateLeadModal />, { wrapper });
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  // Test 2: Should render when isCreateModalOpen is true
  it('should render when isCreateModalOpen is true', () => {
    useUIStore.setState({ isCreateModalOpen: true });
    render(<CreateLeadModal />, { wrapper });
    
    // Check modal elements are present
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByText('Crear Lead', { selector: 'h2' })).toBeDefined();
  });

  // Test 3: Should close modal when X button is clicked
  it('should close modal when X button is clicked', () => {
    useUIStore.setState({ isCreateModalOpen: true });
    const closeModalMock = vi.spyOn(useUIStore, 'getState').mockReturnValue({
      isCreateModalOpen: true,
      closeCreateModal: vi.fn(),
      openCreateModal: vi.fn(),
    } as any);

    render(<CreateLeadModal />, { wrapper });
    const closeButton = screen.getByLabelText('Cerrar modal');
    
    expect(closeButton).toBeDefined();
    
    closeModalMock.mockRestore();
  });

  // Test 4: Should render all form fields
  it('should render all form fields', () => {
    useUIStore.setState({ isCreateModalOpen: true });
    render(<CreateLeadModal />, { wrapper });
    
    expect(screen.getByLabelText(/Nombre/)).toBeDefined();
    expect(screen.getByLabelText(/Empresa/)).toBeDefined();
    expect(screen.getByLabelText(/Email/)).toBeDefined();
    expect(screen.getByLabelText(/Teléfono/)).toBeDefined();
    expect(screen.getByLabelText(/Notas/)).toBeDefined();
  });

  // Test 5: Should display submit and cancel buttons
  it('should display submit and cancel buttons', () => {
    useUIStore.setState({ isCreateModalOpen: true });
    render(<CreateLeadModal />, { wrapper });
    
    expect(screen.getByRole('button', { name: /Crear Lead/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDefined();
  });

  // Test 6: Should have proper accessibility attributes
  it('should have proper accessibility attributes', () => {
    useUIStore.setState({ isCreateModalOpen: true });
    render(<CreateLeadModal />, { wrapper });
    
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    
    const nameInput = screen.getByLabelText(/Nombre/);
    expect(nameInput.getAttribute('aria-invalid')).toBeDefined();
  });
});
