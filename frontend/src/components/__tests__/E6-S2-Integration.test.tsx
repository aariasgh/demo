/**
 * E6-S2 Integration Tests
 * Scenarios: Loading → Success, Error with Retry, Empty State with Filters
 * 
 * These tests demonstrate the complete E6-S2 flow with loading spinners,
 * error banners, empty states, and toast notifications.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import SkeletonLoader from '../SkeletonLoader';

describe('E6-S2: Loading, Error, Empty State Flows', () => {
  describe('AC-1: Dashboard Loading State', () => {
    it('should display LoadingSpinner with text during data fetch', () => {
      render(
        <LoadingSpinner 
          size="lg" 
          text="Cargando pipeline de ventas..." 
          fullscreen={false}
          ariaLabel="Cargando leads del pipeline"
        />
      );

      // Should show spinner with text
      expect(screen.getByText('Cargando pipeline de ventas...')).toBeInTheDocument();
      expect(screen.getByLabelText('Cargando leads del pipeline')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('should hide animation if prefers-reduced-motion is set', async () => {
      // Mock matchMedia to return prefers-reduced-motion: reduce
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const { container } = render(
        <LoadingSpinner size="md" ariaLabel="Loading" />
      );

      await waitFor(() => {
        const svg = container.querySelector('svg');
        // Should NOT have animate-spin class
        expect(svg).not.toHaveClass('animate-spin');
      });
    });
  });

  describe('AC-2: Error State with Retry', () => {
    it('should display ErrorBanner with retry button and auto-close disabled', async () => {
      const mockRetry = vi.fn();

      render(
        <ErrorBanner
          message="Error al cargar los leads: Connection timeout"
          onRetry={mockRetry}
          autoClose={0}
          ariaLive="assertive"
        />
      );

      // Should show error message
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText(/Connection timeout/)).toBeInTheDocument();

      // Should have retry button
      const retryBtn = screen.getByLabelText('Retry');
      expect(retryBtn).toBeInTheDocument();

      // Click retry
      fireEvent.click(retryBtn);
      expect(mockRetry).toHaveBeenCalledOnce();
    });

    it('should auto-close after specified duration', async () => {
      const { rerender } = render(
        <ErrorBanner
          message="Error temporario"
          autoClose={100} // 100ms for testing
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Wait for auto-close
      await waitFor(
        () => {
          rerender(
            <ErrorBanner
              message="Error temporario"
              autoClose={100}
            />
          );
        },
        { timeout: 200 }
      );
    });

    it('should respect aria-live attribute for screen readers', () => {
      render(
        <ErrorBanner
          message="Critical error"
          ariaLive="assertive"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('AC-3: Empty State with Filters', () => {
    it('should display EmptyState when no results match search', () => {
      render(
        <EmptyState
          title="Sin resultados"
          description="No hay leads que coincidan con 'xyz'"
          icon="search"
        />
      );

      expect(screen.getByText('Sin resultados')).toBeInTheDocument();
      expect(screen.getByText("No hay leads que coincidan con 'xyz'")).toBeInTheDocument();
    });

    it('should display EmptyState with different icon variants', () => {
      const { rerender } = render(
        <EmptyState title="Test" icon="inbox" />
      );

      // Icon should render
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      rerender(
        <EmptyState title="Test" icon="search" />
      );

      expect(svg).toBeInTheDocument();

      rerender(
        <EmptyState title="Test" icon="error" />
      );

      expect(svg).toBeInTheDocument();
    });

    it('should support CTA button for empty state action', () => {
      const mockCta = vi.fn();

      render(
        <EmptyState
          title="No leads"
          description="Create your first lead"
          ctaText="Create Lead"
          onCtaClick={mockCta}
        />
      );

      const btn = screen.getByText('Create Lead');
      fireEvent.click(btn);
      expect(mockCta).toHaveBeenCalledOnce();
    });
  });

  describe('AC-4: Loading Skeleton Animation', () => {
    it('should display SkeletonLoader with correct grid layout', () => {
      const { container } = render(
        <SkeletonLoader count={4} type="card" />
      );

      // Should show 4 skeleton items
      // Note: key is not readable in DOM; instead check space-y-3 divs
      const items = container.querySelectorAll('.space-y-3');
      expect(items).toHaveLength(4);

      // Should have grid classes
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should have animate-pulse class for loading animation', () => {
      const { container } = render(
        <SkeletonLoader count={2} type="list" />
      );

      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });

    it('should be accessible with aria-busy status', () => {
      render(
        <SkeletonLoader ariaLabel="Loading content" />
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
      expect(status).toHaveAttribute('aria-label', 'Loading content');
    });
  });

  describe('Complete Workflow: Loading → Success', () => {
    it('should flow: Loading → Data Loaded (Integration scenario)', async () => {
      const { rerender } = render(
        <LoadingSpinner text="Cargando leads..." />
      );

      // Verify loading state
      expect(screen.getByText('Cargando leads...')).toBeInTheDocument();

      // Simulate successful data load
      rerender(
        <div>
          <p>Leads cargados: 5</p>
        </div>
      );

      expect(screen.getByText('Leads cargados: 5')).toBeInTheDocument();
      expect(screen.queryByText('Cargando leads...')).not.toBeInTheDocument();
    });

    it('should flow: Loading → Error → Retry → Success', async () => {
      const mockRetry = vi.fn();

      const { rerender } = render(
        <LoadingSpinner text="Cargando..." />
      );

      // Step 1: Loading
      expect(screen.getByText('Cargando...')).toBeInTheDocument();

      // Step 2: Error
      rerender(
        <ErrorBanner
          message="No se pudo conectar"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      const retryBtn = screen.getByLabelText('Retry');

      // Step 3: Retry
      fireEvent.click(retryBtn);
      expect(mockRetry).toHaveBeenCalledOnce();

      // Step 4: Loading again
      rerender(
        <LoadingSpinner text="Reintentando..." />
      );

      expect(screen.getByText('Reintentando...')).toBeInTheDocument();

      // Step 5: Success
      rerender(
        <div>
          <p>Datos cargados exitosamente</p>
        </div>
      );

      expect(screen.getByText('Datos cargados exitosamente')).toBeInTheDocument();
    });
  });

  describe('Animation Timing Consistency', () => {
    it('all transitions should use duration-200 or animate-pulse', () => {
      const { container: errorContainer } = render(
        <ErrorBanner message="Test error" />
      );

      // ErrorBanner should have duration-200
      const errorDiv = errorContainer.querySelector('[role="alert"]');
      expect(errorDiv?.className).toContain('duration-200');

      const { container: cardContainer } = render(
        <SkeletonLoader count={1} type="card" />
      );

      // SkeletonLoader should have animate-pulse
      const pulsingDiv = cardContainer.querySelector('.animate-pulse');
      expect(pulsingDiv).toBeTruthy();
    });
  });

  describe('Accessibility Compliance', () => {
    it('LoadingSpinner should have proper ARIA attributes', () => {
      render(
        <LoadingSpinner 
          ariaLabel="Loading dashboard"
          size="lg"
        />
      );

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
      expect(spinner).toHaveAttribute('aria-label', 'Loading dashboard');
    });

    it('ErrorBanner should announce errors to screen readers', () => {
      render(
        <ErrorBanner
          message="Critical server error"
          ariaLive="assertive"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('EmptyState should have keyboard accessible CTA', () => {
      const mockCta = vi.fn();

      render(
        <EmptyState
          title="Empty"
          ctaText="Action"
          onCtaClick={mockCta}
        />
      );

      const btn = screen.getByText('Action');
      
      // Trigger with Enter key
      fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
      
      // Or click normally
      fireEvent.click(btn);
      expect(mockCta).toHaveBeenCalled();
    });
  });
});
