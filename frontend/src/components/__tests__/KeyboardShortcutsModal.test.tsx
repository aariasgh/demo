import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KeyboardShortcutsModal } from '../KeyboardShortcutsModal'

// Mock FocusTrap to avoid focus-trap-react issues in tests
vi.mock('focus-trap-react', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('KeyboardShortcutsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render modal when isOpen is true', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(<KeyboardShortcutsModal isOpen={false} onClose={vi.fn()} />)
    const dialog = screen.queryByRole('dialog')
    expect(dialog).not.toBeInTheDocument()
  })

  it('should display modal title', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('Atajos de Teclado')).toBeInTheDocument()
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('should display navigation shortcuts', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    
    expect(screen.getByText(/Navegación/)).toBeInTheDocument()
    // Check for navigation section exists
    const navSection = screen.getByText(/Navegación/).closest('section')
    expect(navSection).toBeInTheDocument()
  })

  it('should display action shortcuts', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    
    expect(screen.getByText(/Acciones/)).toBeInTheDocument()
  })

  it('should display all keyboard shortcuts section', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    
    // Check for keyboard shortcuts heading
    const headings = screen.getAllByRole('heading')
    const hasShortcutsHeading = headings.some(h => h.textContent?.includes('Atajos'))
    expect(hasShortcutsHeading).toBe(true)
  })

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn()
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />)
    
    // Get the first close button (in header)
    const closeButtons = screen.getAllByRole('button')
    fireEvent.click(closeButtons[0])
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onClose when Escape key is pressed', () => {
    const mockOnClose = vi.fn()
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />)
    
    // Dispatch keydown event on document
    fireEvent.keyDown(document, { key: 'Escape' })
    
    // Mock will be called due to the useEffect listener
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should have proper accessibility attributes', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Keyboard Shortcuts')
  })

  it('should display tips section', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    
    expect(screen.getByText(/Tips/i)).toBeInTheDocument()
    // Check for tips content
    const tipsContent = screen.getByText(/navegar entre elementos/)
    expect(tipsContent).toBeInTheDocument()
  })

  it('should have close button with proper accessibility', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should stop event propagation when clicking inside modal', () => {
    const mockOnClose = vi.fn()
    render(<KeyboardShortcutsModal isOpen={true} onClose={mockOnClose} />)
    
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    
    // Should not call onClose since we stop propagation
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
