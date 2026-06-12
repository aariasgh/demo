/**
 * Timezone Utilities
 * Ensures consistent date handling across browser and backend
 */

/**
 * Format date in user's local timezone
 * Shows time ago for recent dates, full date for older dates
 */
export function formatDateWithTimezone(
  isoString: string,
  options?: { style?: 'relative' | 'absolute' | 'relative-short' }
): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const style = options?.style || 'relative';

    if (style === 'relative' || style === 'relative-short') {
      // Show time ago for recent dates
      if (diffMinutes < 60) {
        return style === 'relative-short' 
          ? `${diffMinutes}m` 
          : `hace ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;
      }
      if (diffHours < 24) {
        return style === 'relative-short'
          ? `${diffHours}h`
          : `hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
      }
      if (diffDays < 7) {
        return style === 'relative-short'
          ? `${diffDays}d`
          : `hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
      }
    }

    // Absolute format for older dates
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * Calculate days between two dates considering timezone
 */
export function calculateDaysDifference(
  dateString: string,
  referenceDate?: Date
): number {
  const date = new Date(dateString);
  const ref = referenceDate || new Date();

  // Calculate days in UTC to avoid timezone-based off-by-one errors
  const dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const refUTC = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());

  const diffMs = refUTC - dateUTC;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Convert UTC timestamp to local timezone date
 */
export function convertUTCToLocal(utcString: string): Date {
  return new Date(utcString);
}

/**
 * Get current time in ISO format (for API calls)
 */
export function getCurrentTimeISO(): string {
  return new Date().toISOString();
}

/**
 * Format duration in human-readable way
 * Useful for showing how long a lead hasn't changed status
 */
export function formatDuration(days: number): string {
  // Guard against negative/invalid values
  if (days < 0) {
    return 'Fecha inválida';
  }
  if (days === 0) {
    return 'Hoy';
  }
  if (days === 1) {
    return '1 día';
  }
  if (days < 7) {
    return `${days} días`;
  }
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  if (remainingDays === 0) {
    return `${weeks}w`;
  }
  return `${weeks}w ${remainingDays}d`;
}
