/**
 * Unit Tests for LeadCard Component
 * Tests: rendering lead info, hover effects, action buttons
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '../utils/test-utils';
import LeadCard from './LeadCard';
import type { Lead } from '../types';

describe('LeadCard', () => {
  const mockLead: Lead = {
    id: 1,
    name: 'John Doe',
    company: 'Acme Corp',
    email: 'john@acme.com',
    status: 'Nuevo',
    created_at: '2026-06-09T10:00:00Z',
    updated_at: '2026-06-09T10:00:00Z',
  };

  it('should render lead name', () => {
    renderWithProviders(<LeadCard lead={mockLead} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render lead company', () => {
    renderWithProviders(<LeadCard lead={mockLead} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('should render lead email', () => {
    renderWithProviders(<LeadCard lead={mockLead} />);

    expect(screen.getByText('john@acme.com')).toBeInTheDocument();
  });

  it('should show action buttons on hover', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} onEdit={onEdit} onDelete={onDelete} />
    );

    const card = container.querySelector('[role="article"]');
    if (!card) throw new Error('Card not found');

    // Simulate hover
    fireEvent.mouseEnter(card);

    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Opciones')).toBeInTheDocument();
  });

  it('should hide action buttons when not hovering', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} onEdit={onEdit} onDelete={onDelete} />
    );

    const card = container.querySelector('[role="article"]');
    if (!card) throw new Error('Card not found');

    // Simulate hover, then unhover
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);

    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Opciones')).not.toBeInTheDocument();
  });

  it('should call onEdit when Edit button clicked', () => {
    const onEdit = vi.fn();

    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} onEdit={onEdit} />
    );

    const card = container.querySelector('[role="article"]');
    if (!card) throw new Error('Card not found');

    fireEvent.mouseEnter(card);
    const editBtn = screen.getByText('Editar');
    fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledWith(mockLead.id);
  });

  it('should call onDelete when Delete button clicked', () => {
    const onDelete = vi.fn();

    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} onDelete={onDelete} />
    );

    const card = container.querySelector('[role="article"]');
    if (!card) throw new Error('Card not found');

    fireEvent.mouseEnter(card);
    const deleteBtn = screen.getByText('Opciones');
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockLead.id);
  });

  it('should have correct ARIA label with state and drag instructions', () => {
    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} />
    );

    const card = container.querySelector('[role="article"]');
    expect(card).toHaveAttribute(
      'aria-label',
      'Lead: John Doe de Acme Corp. Estado: Nuevo. Arrastra para cambiar estado.'
    );
  });

  it('should change border color on hover', () => {
    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} />
    );

    const card = container.querySelector('[role="article"]');
    if (!card) throw new Error('Card not found');

    // Check initial classes
    expect(card).toHaveClass('border-gray-200');

    // Simulate hover
    fireEvent.mouseEnter(card);

    // Check hover classes
    expect(card).toHaveClass('border-blue-500');
  });

  it('should be draggable=false', () => {
    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} />
    );

    const card = container.querySelector('[role="article"]');
    expect(card).toHaveAttribute('draggable', 'false');
  });

  it('should truncate long text', () => {
    const longLead: Lead = {
      ...mockLead,
      name: 'This is a very long name that should be truncated',
      company: 'This is a very long company name that should also be truncated',
      email: 'this.is.a.very.long.email.address@example.com',
    };

    renderWithProviders(<LeadCard lead={longLead} />);

    expect(screen.getByText(longLead.name)).toHaveClass('truncate');
    expect(screen.getByText(longLead.company)).toHaveClass('truncate');
    expect(screen.getByText(longLead.email)).toHaveClass('truncate');
  });

  it('should have minimum height of 120px', () => {
    const { container } = renderWithProviders(
      <LeadCard lead={mockLead} />
    );

    const card = container.querySelector('[role="article"]');
    if (!card) throw new Error('Card not found');

    expect(card).toHaveClass('min-h-[120px]');
  });

  it('should handle optional fields gracefully', () => {
    const leadWithoutPhone: Lead = {
      ...mockLead,
      phone: undefined,
    };

    renderWithProviders(<LeadCard lead={leadWithoutPhone} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Phone should not be rendered
    const allText = screen.queryByText(/^\d{10,}$/);
    expect(allText).not.toBeInTheDocument();
  });
});
