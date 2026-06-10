/**
 * Unit Tests for KanbanColumn Component
 * Tests: rendering column, status colors, empty states, lead cards
 */

import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../utils/test-utils';
import KanbanColumn from './KanbanColumn';
import { STATUS_COLORS } from '../utils/constants';
import type { Lead } from '../types';

describe('KanbanColumn', () => {
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
  ];

  it('should render column with correct status title', () => {
    renderWithProviders(
      <KanbanColumn status="Nuevo" leads={mockLeads} />
    );

    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('should display correct lead count', () => {
    renderWithProviders(
      <KanbanColumn status="Nuevo" leads={mockLeads} />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render correct status color', () => {
    const { container } = renderWithProviders(
      <KanbanColumn status="Nuevo" leads={mockLeads} />
    );

    const colorDot = container.querySelector('.w-4.h-4.rounded-full');
    expect(colorDot).toHaveStyle({ backgroundColor: STATUS_COLORS['Nuevo'] });
  });

  it('should render all lead cards', () => {
    renderWithProviders(
      <KanbanColumn status="Nuevo" leads={mockLeads} />
    );

    expect(screen.getByText('Lead 1')).toBeInTheDocument();
    expect(screen.getByText('Lead 2')).toBeInTheDocument();
  });

  it('should show empty state when no leads', () => {
    renderWithProviders(
      <KanbanColumn status="Nuevo" leads={[]} />
    );

    expect(screen.getByText('No hay leads aún')).toBeInTheDocument();
    expect(screen.getByText('Crea tu primer lead')).toBeInTheDocument();
  });

  it('should have correct ARIA label', () => {
    const { container } = renderWithProviders(
      <KanbanColumn status="Nuevo" leads={mockLeads} />
    );

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('aria-label', 'Columna Nuevo con 2 leads');
  });

  it('should render all 4 status colors correctly', () => {
    const statuses = ['Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'];

    statuses.forEach((status) => {
      const { container } = renderWithProviders(
        <KanbanColumn status={status} leads={[]} />
      );

      const colorDot = container.querySelector('.w-4.h-4.rounded-full');
      expect(colorDot).toHaveStyle({ backgroundColor: STATUS_COLORS[status] });
    });
  });
});
