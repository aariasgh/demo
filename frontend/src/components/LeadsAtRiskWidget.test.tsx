import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils/test-utils';
import LeadsAtRiskWidget from './LeadsAtRiskWidget';
import * as apiErrorHandling from '../utils/apiErrorHandling';

// Mock fetchWithRetry
vi.mock('../utils/apiErrorHandling', () => ({
  fetchWithRetry: vi.fn(),
  classifyError: vi.fn((err: any) => ({
    message: err?.message || 'Unknown error',
    isRetryable: true,
  })),
}));

// Mock toastNotifier
vi.mock('../utils/toastNotifier', () => ({
  toastNotifier: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LeadsAtRiskWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test 1: Widget renders zero state with "Todos en día" message when no leads are at risk
   * AC-5.2: Shows positive message when no leads at risk
   */
  it('should render zero state with "Todos en día" message when no leads are at risk', async () => {
    vi.mocked(apiErrorHandling.fetchWithRetry).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    } as any);

    renderWithProviders(<LeadsAtRiskWidget onOpenPanel={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Todos en día')).toBeInTheDocument();
      expect(screen.getByText('No hay leads en riesgo')).toBeInTheDocument();
    });
  });

  /**
   * Test 2: Widget renders count badge when leads are at risk
   * AC-3.2: Shows correct count badge
   */
  it('should render count badge when leads are at risk', async () => {
    const mockLeads = [
      {
        id: 1,
        name: 'Lead 1',
        company: 'Corp A',
        email: 'test1@test.com',
        status: 'Nuevo',
        priority: null,
        days_without_change: 8,
        created_at: '2026-06-03T00:00:00Z',
        last_status_change_at: '2026-06-03T00:00:00Z',
      },
      {
        id: 2,
        name: 'Lead 2',
        company: 'Corp B',
        email: 'test2@test.com',
        status: 'En contacto',
        priority: null,
        days_without_change: 10,
        created_at: '2026-06-01T00:00:00Z',
        last_status_change_at: '2026-06-01T00:00:00Z',
      },
    ];

    vi.mocked(apiErrorHandling.fetchWithRetry).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLeads, count: 2 }),
    } as any);

    renderWithProviders(<LeadsAtRiskWidget onOpenPanel={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/2 Leads en Riesgo/)).toBeInTheDocument();
    });
  });

  /**
   * Test 3: Widget is clickable and calls onOpenPanel callback
   * AC-3.3: Clickable to open panel
   */
  it('should call onOpenPanel callback when clicked', async () => {
    const mockOnOpenPanel = vi.fn();

    vi.mocked(apiErrorHandling.fetchWithRetry).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    } as any);

    const { container } = renderWithProviders(<LeadsAtRiskWidget onOpenPanel={mockOnOpenPanel} />);

    await waitFor(() => {
      expect(screen.getByText('Todos en día')).toBeInTheDocument();
    });

    const widgetDiv = container.querySelector('[class*="rounded-lg"][class*="cursor-pointer"]');
    if (widgetDiv) {
      await userEvent.click(widgetDiv);
    }

    expect(mockOnOpenPanel).toHaveBeenCalled();
  });

  /**
   * Test 4: Widget fetches data on mount
   * AC-6.3: Auto-refresh pattern (initial fetch)
   */
  it('should fetch at-risk leads on component mount', async () => {
    vi.mocked(apiErrorHandling.fetchWithRetry).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    } as any);

    renderWithProviders(<LeadsAtRiskWidget onOpenPanel={vi.fn()} />);

    await waitFor(() => {
      expect(vi.mocked(apiErrorHandling.fetchWithRetry)).toHaveBeenCalledWith('/api/leads/at-risk', {}, expect.any(Object));
    });
  });

  /**
   * Test 5: Widget handles error state gracefully
   * AC: Error handling
   */
  it('should display error message when fetch fails', async () => {
    vi.mocked(apiErrorHandling.fetchWithRetry).mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<LeadsAtRiskWidget onOpenPanel={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar leads')).toBeInTheDocument();
    });
  });

  /**
   * Test 6: Widget shows singular "Lead" for 1 lead at risk
   * AC: Grammar/UX
   */
  it('should use singular "Lead" when exactly 1 lead is at risk', async () => {
    const mockLead = [
      {
        id: 1,
        name: 'Single Lead',
        company: 'Corp',
        email: 'test@test.com',
        status: 'Nuevo',
        priority: null,
        days_without_change: 8,
        created_at: '2026-06-03T00:00:00Z',
        last_status_change_at: '2026-06-03T00:00:00Z',
      },
    ];

    vi.mocked(apiErrorHandling.fetchWithRetry).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLead, count: 1 }),
    } as any);

    renderWithProviders(<LeadsAtRiskWidget onOpenPanel={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/1 Lead en Riesgo/)).toBeInTheDocument();
    });
  });
});
