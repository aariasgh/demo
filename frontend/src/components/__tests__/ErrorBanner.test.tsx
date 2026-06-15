import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ErrorBanner from '../ErrorBanner';

describe('ErrorBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // Basic Rendering Tests
  // ============================================================

  it('renders error message when provided', () => {
    render(<ErrorBanner message="Failed to load leads" />);
    expect(screen.getByText('Failed to load leads')).toBeInTheDocument();
  });

  it('renders with red background (error color scheme)', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('bg-red-100');
  });

  it('renders with error text color', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('text-red-900');
  });

  // ============================================================
  // Retry Button Tests
  // ============================================================

  it('renders retry button when onRetry callback provided', () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error" onRetry={onRetry} />);
    const retryButton = screen.getByRole('button', { name: /retry|reintentar/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('does not render retry button when onRetry not provided', () => {
    render(<ErrorBanner message="Error" />);
    const retryButton = screen.queryByRole('button', { name: /retry|reintentar/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry|reintentar/i });
    await user.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // Close Button Tests
  // ============================================================

  it('renders close button (X icon)', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const closeButton = container.querySelector('button[aria-label="Close"]');
    expect(closeButton).toBeInTheDocument();
  });

  it('close button hides the banner when clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorBanner message="Error" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    
    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // Auto-close Tests
  // ============================================================

  it('has autoClose prop support', () => {
    render(<ErrorBanner message="Error" autoClose={2000} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    // Component accepts autoClose prop without errors
  });

  it('does not auto-close by default', () => {
    render(<ErrorBanner message="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  // ============================================================
  // Accessibility Tests
  // ============================================================

  it('has role="alert" for error announcements', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveAttribute('role', 'alert');
  });

  it('has aria-live attribute set correctly', () => {
    const ariaLive = 'polite';
    const { container } = render(
      <ErrorBanner message="Error" ariaLive={ariaLive} />
    );
    const banner = container.firstChild;
    expect(banner).toHaveAttribute('aria-live', ariaLive);
  });

  it('has default aria-live="assertive" for errors', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveAttribute('aria-live', 'assertive');
  });

  it('has aria-label on close button for accessibility', () => {
    render(<ErrorBanner message="Error" />);
    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  // ============================================================
  // Animation Tests
  // ============================================================

  it('renders with fade animation classes', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    // Should have transition class for fade animation
    expect(banner).toHaveClass('transition-opacity');
  });

  // ============================================================
  // Layout Tests
  // ============================================================

  it('renders as top-aligned banner (flex layout)', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('flex', 'items-center', 'justify-between');
  });

  it('renders with padding for proper spacing', () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('p-4');
  });

  // ============================================================
  // Message Variants
  // ============================================================

  it('handles long error messages', () => {
    const longMessage = 'This is a very long error message that might span multiple lines in the UI';
    render(<ErrorBanner message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles special characters in error message', () => {
    const message = 'Error: "Failed to save" & retry required';
    render(<ErrorBanner message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
