/**
 * Unit Tests for KanbanBoard Component
 * Tests: rendering, grouping by status, empty states, loading/error states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KanbanBoard from './KanbanBoard';
import * as useLeadsByStatusHook from '../hooks/useLeadsByStatus';
import type { Lead } from '../types';

describe('KanbanBoard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const mockLeads: Lead[] = [
    {
      id: 1,
      name: 'Lead 1',
      company: 'Company A',
      email: 'lead1@company.com',
      status: 'Nuevo',
      created_at: '2026-06-09T10:00:00Z',
      updated_at: '2026-06-09T10:00:00Z',
    },
    {
      id: 2,
      name: 'Lead 2',
      company: 'Company B',
      email: 'lead2@company.com',
      status: 'Nuevo',
      created_at: '2026-06-09T10:01:00Z',
      updated_at: '2026-06-09T10:01:00Z',
    },
    {
      id: 3,
      name: 'Lead 3',
      company: 'Company C',
      email: 'lead3@company.com',
      status: 'En contacto',
      created_at: '2026-06-09T10:02:00Z',
      updated_at: '2026-06-09T10:02:00Z',
    },
    {
      id: 4,
      name: 'Lead 4',
      company: 'Company D',
      email: 'lead4@company.com',
      status: 'Propuesta enviada',
      created_at: '2026-06-09T10:03:00Z',
      updated_at: '2026-06-09T10:03:00Z',
    },
    {
      id: 5,
      name: 'Lead 5',
      company: 'Company E',
      email: 'lead5@company.com',
      status: 'Cerrado',
      created_at: '2026-06-09T10:04:00Z',
      updated_at: '2026-06-09T10:04:00Z',
    },
  ];

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should render 4 columns with correct status titles', () => {
    vi.spyOn(useLeadsByStatusHook, 'useLeadsByStatus').mockReturnValue({
      groupedLeads: {
        'Nuevo': [],
        'En contacto': [],
        'Propuesta enviada': [],
        'Cerrado': [],
      },
      isLoading: false,
      error: null,
      totalLeads: 0,
    });

    renderWithProviders(<KanbanBoard />);

    expect(screen.getByText('Nuevo')).toBeInTheDocument();
    expect(screen.getByText('En contacto')).toBeInTheDocument();
    expect(screen.getByText('Propuesta enviada')).toBeInTheDocument();
    expect(screen.getByText('Cerrado')).toBeInTheDocument();
  });

  it('should display correct lead counts per status', () => {
    vi.spyOn(useLeadsByStatusHook, 'useLeadsByStatus').mockReturnValue({
      groupedLeads: {
        'Nuevo': mockLeads.filter((l) => l.status === 'Nuevo'),
        'En contacto': mockLeads.filter((l) => l.status === 'En contacto'),
        'Propuesta enviada': mockLeads.filter((l) => l.status === 'Propuesta enviada'),
        'Cerrado': mockLeads.filter((l) => l.status === 'Cerrado'),
      },
      isLoading: false,
      error: null,
      totalLeads: mockLeads.length,
    });

    renderWithProviders(<KanbanBoard />);

    // Check counters using getAllByLabelText
    const counters = screen.getAllByLabelText(/leads en/);
    expect(counters.length).toBe(4);
    expect(counters[0]).toHaveTextContent('2'); // Nuevo has 2
    expect(counters[1]).toHaveTextContent('1'); // En contacto has 1
    expect(counters[2]).toHaveTextContent('1'); // Propuesta enviada has 1
    expect(counters[3]).toHaveTextContent('1'); // Cerrado has 1
  });

  it('should show empty state for columns without leads', () => {
    vi.spyOn(useLeadsByStatusHook, 'useLeadsByStatus').mockReturnValue({
      groupedLeads: {
        'Nuevo': [],
        'En contacto': [],
        'Propuesta enviada': [],
        'Cerrado': [],
      },
      isLoading: false,
      error: null,
      totalLeads: 0,
    });

    renderWithProviders(<KanbanBoard />);

    // Should show empty state 4 times (one per column)
    const emptyStates = screen.getAllByText('No hay leads aún');
    expect(emptyStates).toHaveLength(4);
  });

  it('should display loading spinner when fetching', () => {
    vi.spyOn(useLeadsByStatusHook, 'useLeadsByStatus').mockReturnValue({
      groupedLeads: {
        'Nuevo': [],
        'En contacto': [],
        'Propuesta enviada': [],
        'Cerrado': [],
      },
      isLoading: true,
      error: null,
      totalLeads: 0,
    });

    const { container } = renderWithProviders(<KanbanBoard />);

    // Look for the spinner element with animate-spin class
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display error message on fetch error', () => {
    vi.spyOn(useLeadsByStatusHook, 'useLeadsByStatus').mockReturnValue({
      groupedLeads: {
        'Nuevo': [],
        'En contacto': [],
        'Propuesta enviada': [],
        'Cerrado': [],
      },
      isLoading: false,
      error: new Error('API Error'),
      totalLeads: 0,
    });

    renderWithProviders(<KanbanBoard />);

    expect(screen.getByText(/Error cargando pipeline/i)).toBeInTheDocument();
  });

  it('should display total leads count', () => {
    vi.spyOn(useLeadsByStatusHook, 'useLeadsByStatus').mockReturnValue({
      groupedLeads: {
        'Nuevo': mockLeads.filter((l) => l.status === 'Nuevo'),
        'En contacto': mockLeads.filter((l) => l.status === 'En contacto'),
        'Propuesta enviada': mockLeads.filter((l) => l.status === 'Propuesta enviada'),
        'Cerrado': mockLeads.filter((l) => l.status === 'Cerrado'),
      },
      isLoading: false,
      error: null,
      totalLeads: mockLeads.length,
    });

    renderWithProviders(<KanbanBoard />);

    expect(screen.getByText('Total de leads: 5')).toBeInTheDocument();
  });

  it('should render lead cards in correct columns', () => {
    vi.spyOn(useLeadsByStatusHook, 'useLeadsByStatus').mockReturnValue({
      groupedLeads: {
        'Nuevo': mockLeads.filter((l) => l.status === 'Nuevo'),
        'En contacto': mockLeads.filter((l) => l.status === 'En contacto'),
        'Propuesta enviada': mockLeads.filter((l) => l.status === 'Propuesta enviada'),
        'Cerrado': mockLeads.filter((l) => l.status === 'Cerrado'),
      },
      isLoading: false,
      error: null,
      totalLeads: mockLeads.length,
    });

    renderWithProviders(<KanbanBoard />);

    // Check that lead names are displayed
    expect(screen.getByText('Lead 1')).toBeInTheDocument();
    expect(screen.getByText('Lead 3')).toBeInTheDocument();
    expect(screen.getByText('Lead 4')).toBeInTheDocument();
    expect(screen.getByText('Lead 5')).toBeInTheDocument();
  });
});
