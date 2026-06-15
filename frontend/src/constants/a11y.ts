/**
 * Accessibility (a11y) Constants & Utilities
 * WCAG AA compliance helpers for React components
 * 
 * Exports:
 * - ARIA role mappings
 * - Focus styling utilities
 * - Semantic HTML helpers
 * - Screen reader announcement templates
 */

/**
 * Role Mappings for Semantic HTML
 * Maps component types to proper ARIA roles when semantic HTML is not available
 */
export const ARIA_ROLES = {
  MAIN: 'main',
  BANNER: 'banner',
  NAVIGATION: 'navigation',
  CONTENTINFO: 'contentinfo',
  REGION: 'region',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  BUTTON: 'button',
  LINK: 'link',
  LISTITEM: 'listitem',
  LIST: 'list',
  COMPLEMENTARY: 'complementary',
  FORM: 'form',
} as const;

/**
 * Tailwind CSS Classes for Focus Styling (WCAG AA)
 * - outline-2: 2px width (WCAG AA minimum)
 * - outline-blue-500: High contrast color
 * - outline-offset-2: Separation from element
 */
export const FOCUS_CLASSES =
  'focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2';

/**
 * Screen Reader Announcement Templates
 * Used with aria-live regions for dynamic content updates
 */
export const A11Y_MESSAGES = {
  // Buttons & Controls
  BUTTON_CLICKED: (label: string) => `${label} activado`,
  BUTTON_LOADING: (label: string) => `${label} cargando`,
  BUTTON_DISABLED: (label: string) => `${label} deshabilitado`,

  // Form Validation
  FIELD_ERROR: (fieldName: string, error: string) => `${fieldName}: ${error}`,
  FORM_VALID: 'Formulario listo para enviar',
  FORM_INVALID: 'Formulario contiene errores',

  // Navigation
  NAVIGATION_UPDATED: (location: string) => `Navegado a ${location}`,
  FOCUS_MOVED: (element: string) => `Focus movido a ${element}`,

  // Notifications
  SUCCESS: (message: string) => `Éxito: ${message}`,
  ERROR: (message: string) => `Error: ${message}`,
  WARNING: (message: string) => `Advertencia: ${message}`,
  INFO: (message: string) => `Información: ${message}`,

  // Loading
  LOADING: (item: string) => `Cargando ${item}`,
  LOADED: (item: string) => `${item} cargado`,
  LOADING_COMPLETE: 'Carga completada',

  // Data Changes
  ITEM_ADDED: (item: string) => `${item} agregado`,
  ITEM_UPDATED: (item: string) => `${item} actualizado`,
  ITEM_DELETED: (item: string) => `${item} eliminado`,
  ITEM_COUNT_UPDATED: (count: number, item: string) =>
    `${count} ${count === 1 ? item : item + 's'} disponible${count === 1 ? '' : 's'}`,
} as const;

/**
 * Keyboard Constants for Accessibility
 * Standard keyboard interactions for web apps
 */
export const KEYBOARD = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  TAB: 'Tab',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * WCAG AA Contrast Ratio Requirements
 */
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5, // 4.5:1 for normal text (14px and below)
  LARGE_TEXT: 3.0, // 3:1 for large text (18px+ or 14px+ bold)
  UI_COMPONENTS: 3.0, // 3:1 for UI components
} as const;

/**
 * Tailwind Classes for Text Sizing (WCAG AA)
 * Large text: 18px+ or 14px+ bold
 */
export const LARGE_TEXT_CLASSES = {
  SIZE_18: 'text-lg', // 18px
  SIZE_20: 'text-xl', // 20px
  SIZE_24: 'text-2xl', // 24px
  BOLD_14: 'font-bold text-base', // 14px bold
  BOLD_16: 'font-bold text-base', // 16px bold (inherent)
} as const;

/**
 * Helper: Get focus classes for a component
 * Returns Tailwind classes for WCAG AA focus styling
 */
export const getFocusClasses = (): string => FOCUS_CLASSES;

/**
 * Helper: Check if device prefers reduced motion
 * Returns true if user has prefers-reduced-motion: reduce
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Helper: Create aria-label for icon-only buttons
 * Ensures screen readers understand button purpose
 */
export const getIconButtonLabel = (action: string, context?: string): string => {
  const contextStr = context ? ` de ${context}` : '';
  return `${action}${contextStr}`;
};

/**
 * Helper: Create aria-label for status indicators
 * e.g., "Nuevo, lead con estado" instead of just "Nuevo"
 */
export const getStatusLabel = (status: string): string => `${status}, estado de lead`;

/**
 * Helper: Get screen reader announcement for list update
 * e.g., "3 leads en Nuevo"
 */
export const getColumnAnnouncement = (status: string, count: number): string => {
  const plural = count === 1 ? 'lead' : 'leads';
  return `${count} ${plural} en ${status}`;
};

/**
 * Export motion preference configuration for animations
 */
export const getAnimationConfig = () => ({
  reducedMotion: prefersReducedMotion(),
  defaultDuration: '200ms', // E6-S2 standard
  noAnimationDuration: '0ms',
  reducedAnimationDuration: '100ms', // Very brief when reduced motion is on
});

/**
 * Helper: Strip ARIA attributes from cloned elements
 * Useful when creating dynamic content that should be screen-reader silent
 */
export const clearAriaAttributes = (element: HTMLElement): void => {
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith('aria-')) {
      element.removeAttribute(attr.name);
    }
  });
};

/**
 * Helper: Validate focus outline is visible
 * For testing purposes - checks if element has focus styling applied
 */
export const hasFocusOutline = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  const outlineWidth = style.outlineWidth;
  const outlineColor = style.outlineColor;
  return outlineWidth !== '0px' && outlineColor !== 'rgba(0, 0, 0, 0)';
};
