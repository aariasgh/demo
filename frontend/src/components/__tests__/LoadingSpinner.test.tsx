import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    // Reset matchMedia mock before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // Basic Rendering Tests
  // ============================================================

  it('renders spinner with aria-label when provided', () => {
    render(<LoadingSpinner ariaLabel="Loading leads" />);
    const spinner = screen.getByLabelText('Loading leads');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with default size (md) when size not provided', () => {
    render(<LoadingSpinner ariaLabel="Loading" />);
    const spinner = screen.getByLabelText('Loading');
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('w-12', 'h-12'); // md = 48px
  });

  it('renders with correct size classes', () => {
    const { rerender } = render(
      <LoadingSpinner size="sm" ariaLabel="Loading" />
    );
    let svg = screen.getByLabelText('Loading').querySelector('svg');
    expect(svg).toHaveClass('w-8', 'h-8'); // sm = 32px

    rerender(<LoadingSpinner size="md" ariaLabel="Loading" />);
    svg = screen.getByLabelText('Loading').querySelector('svg');
    expect(svg).toHaveClass('w-12', 'h-12'); // md = 48px

    rerender(<LoadingSpinner size="lg" ariaLabel="Loading" />);
    svg = screen.getByLabelText('Loading').querySelector('svg');
    expect(svg).toHaveClass('w-16', 'h-16'); // lg = 64px
  });

  it('renders text below spinner when provided', () => {
    render(
      <LoadingSpinner
        ariaLabel="Loading"
        text="Cargando leads..."
      />
    );
    expect(screen.getByText('Cargando leads...')).toBeInTheDocument();
  });

  it('renders fullscreen centered when fullscreen=true', () => {
    const { container } = render(
      <LoadingSpinner
        fullscreen
        ariaLabel="Loading"
      />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('fixed', 'inset-0', 'flex', 'items-center', 'justify-center');
  });

  it('renders inline (not fullscreen) by default', () => {
    const { container } = render(
      <LoadingSpinner ariaLabel="Loading" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass('fixed');
  });

  // ============================================================
  // Animation Tests
  // ============================================================

  it('applies animate-spin class for rotation animation', () => {
    render(<LoadingSpinner ariaLabel="Loading" />);
    const spinner = screen.getByLabelText('Loading').querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('respects prefers-reduced-motion preference', () => {
    // Mock matchMedia to return prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { container } = render(
      <LoadingSpinner ariaLabel="Loading" />
    );
    // When prefers-reduced-motion is detected, should not have animate-spin
    // or should have reduced animation class instead
    const wrapper = container.firstChild;
    // The component should check prefers-reduced-motion and apply appropriate class
    expect(wrapper).toHaveClass('motion-reduce-enabled');
  });

  // ============================================================
  // Accessibility Tests
  // ============================================================

  it('has role="status" for screen reader announcements', () => {
    render(<LoadingSpinner ariaLabel="Loading" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveAttribute('role', 'status');
  });

  it('has aria-live="polite" for dynamic updates', () => {
    render(<LoadingSpinner ariaLabel="Loading" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-busy="true" to indicate loading state', () => {
    render(<LoadingSpinner ariaLabel="Loading" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
  });

  // ============================================================
  // Responsive Tests
  // ============================================================

  it('renders responsive text size based on spinner size', () => {
    const { rerender } = render(
      <LoadingSpinner size="sm" text="Loading" ariaLabel="Loading" />
    );
    let text = screen.getByText('Loading');
    expect(text).toHaveClass('text-sm');

    rerender(
      <LoadingSpinner size="md" text="Loading" ariaLabel="Loading" />
    );
    text = screen.getByText('Loading');
    expect(text).toHaveClass('text-base');

    rerender(
      <LoadingSpinner size="lg" text="Loading" ariaLabel="Loading" />
    );
    text = screen.getByText('Loading');
    expect(text).toHaveClass('text-lg');
  });

  // ============================================================
  // SVG/Icon Tests
  // ============================================================

  it('renders SVG spinner icon', () => {
    render(<LoadingSpinner ariaLabel="Loading" />);
    const svg = screen.getByLabelText('Loading').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('SVG has correct viewBox and dimensions', () => {
    render(<LoadingSpinner ariaLabel="Loading" />);
    const svg = screen.getByLabelText('Loading').querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });
});
