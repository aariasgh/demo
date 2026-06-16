import { useEffect, useRef, type RefObject } from 'react'

/**
 * useFocusTrap: Manages keyboard focus within a modal or overlay element
 * 
 * Implements AC-1.2 requirements:
 * - Tab: Circular navigation within the trapped element
 * - Shift+Tab: Reverse circular navigation
 * - Escape: Close modal and restore focus to trigger element
 * 
 * @param containerRef - Ref to the container element to trap focus within
 * @param isActive - Whether focus trap should be active
 * @param onEscape - Callback when Escape key is pressed
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLDivElement | null>,
  isActive: boolean,
  onEscape: () => void
) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Save the element that had focus before this hook activated
    previousActiveElementRef.current = document.activeElement as HTMLElement

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      if (!containerRef.current) return []
      return Array.from(
        containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => {
        const el = element as HTMLElement
        return !el.hasAttribute('disabled') && el.offsetParent !== null
      }) as HTMLElement[]
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape()
        // Restore focus to the element that triggered the modal
        setTimeout(() => {
          previousActiveElementRef.current?.focus()
        }, 0)
        return
      }

      // Handle Tab key for focus cycling
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements()
        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const activeElement = document.activeElement as HTMLElement
        const currentIndex = focusableElements.indexOf(activeElement)

        if (event.shiftKey) {
          // Shift+Tab: Move to previous element (reverse)
          event.preventDefault()
          const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
          focusableElements[prevIndex].focus()
        } else {
          // Tab: Move to next element
          event.preventDefault()
          const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
          focusableElements[nextIndex].focus()
        }
      }
    }

    // Attach the keydown listener to the container
    containerRef.current.addEventListener('keydown', handleKeyDown)

    // Set initial focus to first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isActive, onEscape])
}
