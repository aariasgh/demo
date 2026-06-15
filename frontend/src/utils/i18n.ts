/**
 * Internationalization (i18n) Utilities
 * Spanish (es-ES) locale support with proper formatting
 * 
 * Features:
 * - String externalization with translation object
 * - Date formatting (dd/mm/yyyy Spanish format)
 * - Number formatting (1.000 Spanish format)
 * - Currency formatting (€ symbol, Spanish locale)
 */

// Translation object - all user-visible strings
export const messages: Record<string, string> = {
  // Buttons & Actions
  'btn.close': 'Cerrar',
  'btn.cancel': 'Cancelar',
  'btn.submit': 'Enviar',
  'btn.save': 'Guardar',
  'btn.delete': 'Eliminar',
  'btn.edit': 'Editar',
  'btn.create': 'Crear',
  'btn.newLead': '+ Nuevo Lead',
  'btn.retry': 'Reintentar',

  // Lead Status
  'status.new': 'Nuevo',
  'status.contact': 'En contacto',
  'status.proposal': 'Propuesta enviada',
  'status.closed': 'Cerrado',

  // Priority
  'priority.low': 'Baja',
  'priority.medium': 'Media',
  'priority.high': 'Alta',
  'priority.urgent': 'Urgente',

  // Placeholders
  'input.search': 'Buscar leads...',
  'input.name': 'Nombre del lead',
  'input.company': 'Empresa',
  'input.email': 'Correo electrónico',
  'input.phone': 'Teléfono (opcional)',
  'input.notes': 'Notas (máximo 1000 caracteres)',

  // Messages
  'msg.loading': 'Cargando leads...',
  'msg.creating': 'Creando lead...',
  'msg.noLeads': 'No hay leads aún',
  'msg.createFirst': 'Crea tu primer lead',
  'msg.noResults': 'No hay leads que coincidan con tu búsqueda',
  'msg.clearSearch': 'Limpiar búsqueda',

  // Success Messages
  'success.leadCreated': 'Lead creado exitosamente',
  'success.leadUpdated': 'Lead actualizado',
  'success.leadDeleted': 'Lead eliminado',

  // Error Messages
  'error.loadingLeads': 'Error al cargar los leads',
  'error.creatingLead': 'Error al crear el lead',
  'error.emailExists': 'Email ya existe en el sistema',
  'error.invalidEmail': 'Email inválido',
  'error.requiredField': 'Este campo es requerido',
  'error.retry': 'Intenta de nuevo',

  // ARIA Labels & Accessibility
  'aria.closeModal': 'Cerrar modal',
  'aria.kanbanDashboard': 'Panel de Kanban para seguimiento de leads',
  'aria.columnNew': 'Columna Nuevo',
  'aria.columnContact': 'Columna En contacto',
  'aria.columnProposal': 'Columna Propuesta enviada',
  'aria.columnClosed': 'Columna Cerrado',
  'aria.leadCard': 'Lead',
  'aria.createForm': 'Formulario para crear nuevo lead',
  'aria.searchInput': 'Buscar leads por nombre, empresa o email',
  'aria.filterButton': 'Filtro de',
  'aria.sortButton': 'Ordenar por',
};

/**
 * Translation helper
 * Returns translated string or key if not found
 */
export const t = (key: string): string => {
  return messages[key] ?? key;
};

/**
 * Format date to Spanish format (dd/mm/yyyy or "1 de junio de 2026")
 */
export const formatDate = (date: Date | string | null | undefined, format: 'short' | 'long' = 'short'): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (format === 'long') {
      // Format: "1 de junio de 2026"
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj);
    } else {
      // Format: "01/06/2026"
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format number to Spanish format (1.000 with dot as thousands separator)
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '';

  try {
    return new Intl.NumberFormat('es-ES').format(num);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(num);
  }
};

/**
 * Format currency to Spanish format (€ 1.000,00)
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '';

  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return String(amount);
  }
};

/**
 * Format date relative to now (e.g., "hace 2 horas")
 * Returns Spanish relative time format
 */
export const formatRelativeTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'justo ahora';
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

    return formatDate(dateObj, 'short');
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Get locale-specific configuration
 */
export const getLocaleConfig = () => ({
  locale: 'es-ES',
  dateFormat: 'dd/mm/yyyy',
  currencySymbol: '€',
  currencyPosition: 'prefix', // € 1.000,00
  decimalSeparator: ',',
  thousandsSeparator: '.',
});
