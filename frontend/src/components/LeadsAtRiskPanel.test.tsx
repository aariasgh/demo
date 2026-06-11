import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadsAtRiskPanel from './LeadsAtRiskPanel';

// Mock fetch globally
globalThis.fetch = vi.fn() as any;

describe('LeadsAtRiskPanel', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test 1: Panel does not render when isOpen is false
   * AC-3.3: Only visible when open
   */
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <LeadsAtRiskPanel isOpen={false} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    expect(container.querySelector('.fixed.right-0')).not.toBeInTheDocument();
  });

  /**
   * Test 2: Panel displays all leads in list when isOpen is true
   * AC-3.4: Shows lead details
   */
  it('should display all leads in list when panel is open', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLeads, count: 2 }),
    });

    render(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Lead 1')).toBeInTheDocument();
      expect(screen.getByText('Lead 2')).toBeInTheDocument();
    });
  });

  /**
   * Test 3: Panel displays lead details (name, company, status, days)
   * AC-3.4: Shows required fields
   */
  it('should display lead details: name, company, status, days_without_change', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockLeads[0]], count: 1 }),
    });

    render(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      // Name
      expect(screen.getByText('Lead 1')).toBeInTheDocument();
      // Company (may be split across elements, just check for the value)
      expect(screen.getByText('Corp A')).toBeInTheDocument();
      // Status
      expect(screen.getByText('Nuevo')).toBeInTheDocument();
      // Days without change
      expect(screen.getByText('8 días')).toBeInTheDocument();
      expect(screen.getByText('sin cambios')).toBeInTheDocument();
    });
  });

  /**
   * Test 4: Click on lead row calls onSelectLead callback and closes panel
   * AC-3.4: Clickable rows
   */
  it('should call onSelectLead and onClose when lead row is clicked', async () => {
    const mockOnSelectLead = vi.fn();
    const mockOnClose = vi.fn();

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockLeads[0]], count: 1 }),
    });

    render(
      <LeadsAtRiskPanel
        isOpen={true}
        onClose={mockOnClose}
        onSelectLead={mockOnSelectLead}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lead 1')).toBeInTheDocument();
    });

    const leadRow = screen.getByText('Lead 1').closest('div[class*="hover:bg-red-50"]');
    if (leadRow) {
      await userEvent.click(leadRow);
    }

    expect(mockOnSelectLead).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Lead 1' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * Test 5: Panel displays overlay that closes panel when clicked
   * AC-5.3: Overlay with close functionality
   */
  it('should close panel when overlay is clicked', async () => {
    const mockOnClose = vi.fn();

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    });

    const { container } = render(
      <LeadsAtRiskPanel isOpen={true} onClose={mockOnClose} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Todos en día')).toBeInTheDocument();
    });

    const overlay = container.querySelector('.fixed.inset-0.bg-black');
    if (overlay) {
      await userEvent.click(overlay);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * Test 6: Panel displays close button that closes panel
   * AC-5.3: Close button
   */
  it('should close panel when close button is clicked', async () => {
    const mockOnClose = vi.fn();

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    });

    render(
      <LeadsAtRiskPanel isOpen={true} onClose={mockOnClose} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Todos en día')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close panel');
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * Test 7: Panel displays zero state when no leads are at risk
   * AC-5.2: "Todos en día" message
   */
  it('should display zero state "Todos en día" when no leads are at risk', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    });

    render(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('Todos en día')).toBeInTheDocument();
      expect(screen.getByText('No hay leads en riesgo')).toBeInTheDocument();
    });
  });

  /**
   * Test 8: Panel displays loading state while fetching
   * AC: UX - Loading indicator
   */
  it('should display loading spinner while fetching leads', async () => {
    let resolvePromise: any;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (globalThis.fetch as any).mockReturnValueOnce({
      ok: true,
      json: async () => fetchPromise,
    });

    const { container } = render(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    // Check for loading spinner
    await waitFor(() => {
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    // Resolve the fetch
    resolvePromise({ data: mockLeads, count: 2 });

    // Now leads should appear
    await waitFor(() => {
      expect(screen.getByText('Lead 1')).toBeInTheDocument();
    });
  });

  /**
   * Test 9: Panel displays error state when fetch fails
   * AC: Error handling
   */
  it('should display error message when fetch fails', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  /**
   * Test 10: Panel is scrollable with many leads (10+)
   * AC-3.4: Scrollable container for many leads
   */
  it('should be scrollable when displaying 10+ leads', async () => {
    const manyLeads = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Lead ${i + 1}`,
      company: `Corp ${i + 1}`,
      email: `test${i + 1}@test.com`,
      status: 'Nuevo',
      priority: null,
      days_without_change: 8 + i,
      created_at: '2026-06-01T00:00:00Z',
      last_status_change_at: '2026-06-01T00:00:00Z',
    }));

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: manyLeads, count: 15 }),
    });

    const { container } = render(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Lead 1')).toBeInTheDocument();
      expect(screen.getByText('Lead 15')).toBeInTheDocument();
    });

    // Check that panel content is scrollable
    const scrollableDiv = container.querySelector('.overflow-y-auto');
    expect(scrollableDiv).toBeInTheDocument();
  });

  /**
   * Test 11: Panel fetches leads when isOpen changes from false to true
   * AC-3.3: Fetches on open
   */
  it('should fetch leads when panel opens (isOpen changes from false to true)', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLeads, count: 2 }),
    });

    const { rerender } = render(
      <LeadsAtRiskPanel isOpen={false} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    expect(globalThis.fetch).not.toHaveBeenCalled();

    rerender(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/leads/at-risk');
    });
  });

  /**
   * Test 12: Panel displays email address for each lead
   * AC-3.4: Additional lead detail
   */
  it('should display email address for each lead', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockLeads[0]], count: 1 }),
    });

    render(
      <LeadsAtRiskPanel isOpen={true} onClose={vi.fn()} onSelectLead={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('test1@test.com')).toBeInTheDocument();
    });
  });
});
