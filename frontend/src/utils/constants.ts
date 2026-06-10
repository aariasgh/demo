/**
 * Application Constants & Design System Values
 * Source: UX-05 Design System Specification
 */

export const STATUS_COLORS: Record<string, string> = {
  "Nuevo": "#3B82F6",                // Blue
  "En contacto": "#F59E0B",          // Amber
  "Propuesta enviada": "#A855F7",    // Purple
  "Cerrado": "#10B981",              // Green
};

export const STATUS_LIGHT_BG: Record<string, string> = {
  "Nuevo": "#EFF6FF",                // Light blue
  "En contacto": "#FEFCE8",          // Light amber
  "Propuesta enviada": "#F3E8FF",    // Light purple
  "Cerrado": "#ECFDF5",              // Light green
};

export const LEAD_STATUSES = [
  "Nuevo",
  "En contacto",
  "Propuesta enviada",
  "Cerrado",
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];

/**
 * Responsive Breakpoints (Tailwind)
 * Mobile: 320px (default)
 * Tablet: 768px (md:)
 * Desktop: 1200px+ (lg:)
 */
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1200,
} as const;
