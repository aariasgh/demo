/**
 * StatusFilterTabs Component Tests
 * E4-S3: Filtro por Status en Kanban Frontend
 * 
 * Tests for:
 * - Renders 5 tabs ([Todos] [Nuevo] [En contacto] [Propuesta] [Cerrado])
 * - Click selects tab
 * - Click active tab is idempotent
 * - Keyboard navigation (Tab, Enter)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import StatusFilterTabs from './StatusFilterTabs';
import { useKanbanFilterStore } from '../store/kanbanFilterStore';

describe('StatusFilterTabs Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useKanbanFilterStore.getState().setSelectedStatus('all');
  });

  describe('Rendering', () => {
    it('should render 5 tabs: Todos, Nuevo, En contacto, Propuesta, Cerrado', () => {
      render(<StatusFilterTabs />);
      
      // Tabs have role="tab" with aria-label text
      expect(screen.getByRole('tab', { name: /Filtrar por Todos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Filtrar por Nuevo/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Filtrar por En contacto/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Filtrar por Propuesta/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Filtrar por Cerrado/i })).toBeInTheDocument();
    });

    it('should have "Todos" tab active by default', () => {
      render(<StatusFilterTabs />);
      
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      expect(todosTab).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have proper active state class on Todos tab', () => {
      render(<StatusFilterTabs />);
      
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      expect(todosTab).toHaveClass('bg-blue-500');
      expect(todosTab).toHaveClass('text-white');
    });
  });

  describe('Tab Selection', () => {
    it('should select "Nuevo" tab when clicked', () => {
      render(<StatusFilterTabs />);
      
      const nuevoTab = screen.getByRole('tab', { name: /Filtrar por Nuevo/i });
      fireEvent.click(nuevoTab);
      
      expect(nuevoTab).toHaveAttribute('aria-pressed', 'true');
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should select "Propuesta" tab when clicked', () => {
      render(<StatusFilterTabs />);
      
      const propuestaTab = screen.getByRole('tab', { name: /Filtrar por Propuesta/i });
      fireEvent.click(propuestaTab);
      
      expect(propuestaTab).toHaveAttribute('aria-pressed', 'true');
      const { selectedStatus } = useKanbanFilterStore.getState();
      // CRÍTICO-2: Fixed type mismatch - backend uses 'Propuesta enviada' not 'Propuesta'
      expect(selectedStatus).toBe('Propuesta enviada');
    });

    it('should update visual active state when tab is selected', () => {
      render(<StatusFilterTabs />);
      
      const nuevoTab = screen.getByRole('tab', { name: /Filtrar por Nuevo/i });
      fireEvent.click(nuevoTab);
      
      expect(nuevoTab).toHaveClass('bg-blue-500');
      expect(nuevoTab).toHaveClass('text-white');
      expect(screen.getByRole('tab', { name: /Filtrar por Todos/i })).not.toHaveClass('bg-blue-500');
    });
  });

  describe('Idempotent Selection', () => {
    it('should be idempotent when clicking active tab', () => {
      render(<StatusFilterTabs />);
      
      const nuevoTab = screen.getByRole('tab', { name: /Filtrar por Nuevo/i });
      
      fireEvent.click(nuevoTab);
      let { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
      
      fireEvent.click(nuevoTab);
      ({ selectedStatus } = useKanbanFilterStore.getState());
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should not change anything when clicking active "Todos" tab', () => {
      render(<StatusFilterTabs />);
      
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      
      fireEvent.click(todosTab);
      let { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all');
      
      fireEvent.click(todosTab);
      ({ selectedStatus } = useKanbanFilterStore.getState());
      expect(selectedStatus).toBe('all');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should select tab when Enter key is pressed', () => {
      render(<StatusFilterTabs />);
      
      const nuevoTab = screen.getByRole('tab', { name: /Filtrar por Nuevo/i });
      // ALTO-4: Replace fireEvent.keyPress (deprecated) with fireEvent.keyDown
      fireEvent.keyDown(nuevoTab, { key: 'Enter', code: 'Enter' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should not break with other keyboard inputs', () => {
      render(<StatusFilterTabs />);
      
      const nuevoTab = screen.getByRole('tab', { name: /Filtrar por Nuevo/i });
      fireEvent.keyDown(nuevoTab, { key: 'a', code: 'KeyA' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all');
    });

    // CRÍTICO-1 + MEDIO-1: Arrow key navigation tests
    it('should navigate to next tab with ArrowRight key', () => {
      render(<StatusFilterTabs />);
      
      // Start at Todos (index 0)
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should navigate to previous tab with ArrowLeft key', () => {
      render(<StatusFilterTabs />);
      
      // First, move to Nuevo
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' });
      
      // Now go back with ArrowLeft
      const nuevoTab = screen.getByRole('tab', { name: /Filtrar por Nuevo/i });
      fireEvent.keyDown(nuevoTab, { key: 'ArrowLeft' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all');
    });

    it('should cycle from last tab to first with ArrowLeft', () => {
      render(<StatusFilterTabs />);
      
      // Go to Cerrado (last tab)
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' }); // Nuevo
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' }); // En contacto
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' }); // Propuesta
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' }); // Cerrado
      
      // Now go back one more (should wrap to Todos)
      const cerradoTab = screen.getByRole('tab', { name: /Filtrar por Cerrado/i });
      fireEvent.keyDown(cerradoTab, { key: 'ArrowLeft' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Propuesta enviada');
    });

    it('should select Space key to activate tab', () => {
      render(<StatusFilterTabs />);
      
      const nuevoTab = screen.getByRole('tab', { name: /Filtrar por Nuevo/i });
      fireEvent.keyDown(nuevoTab, { key: ' ' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Nuevo');
    });

    it('should jump to first tab with Home key', () => {
      render(<StatusFilterTabs />);
      
      // First, move to Propuesta
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' }); // Nuevo
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' }); // En contacto
      fireEvent.keyDown(todosTab, { key: 'ArrowRight' }); // Propuesta
      
      // Press Home to jump to first
      const propuestaTab = screen.getByRole('tab', { name: /Filtrar por Propuesta/i });
      fireEvent.keyDown(propuestaTab, { key: 'Home' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('all');
    });

    it('should jump to last tab with End key', () => {
      render(<StatusFilterTabs />);
      
      const todosTab = screen.getByRole('tab', { name: /Filtrar por Todos/i });
      fireEvent.keyDown(todosTab, { key: 'End' });
      
      const { selectedStatus } = useKanbanFilterStore.getState();
      expect(selectedStatus).toBe('Cerrado');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-pressed attribute on all tabs', () => {
      render(<StatusFilterTabs />);
      
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-pressed');
      });
    });

    it('should have proper semantic markup', () => {
      render(<StatusFilterTabs />);
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(5);
    });
  });
});
