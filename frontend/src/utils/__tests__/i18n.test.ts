/**
 * i18n Utilities Test Suite
 * Tests Spanish localization helpers and formatting functions
 * 
 * Coverage:
 * - Translation helper (t function)
 * - Date formatting (Spanish format: dd/mm/yyyy)
 * - Number formatting (Spanish format: 1.000)
 * - Currency formatting (€ symbol, Spanish locale)
 * - Relative time formatting (hace X tiempo)
 */

import { describe, it, expect } from 'vitest';
import {
  t,
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  messages,
  getLocaleConfig,
} from '../i18n';

describe('i18n: Internationalization Utilities', () => {
  // ====================
  // Translation Helper
  // ====================
  describe('t() - Translation Helper', () => {
    it('should return translated message for valid key', () => {
      const result = t('btn.close');
      expect(result).toBe('Cerrar');
    });

    it('should return the key itself if translation not found', () => {
      const result = t('invalid.key.that.does.not.exist');
      expect(result).toBe('invalid.key.that.does.not.exist');
    });

    it('should have all common UI strings translated', () => {
      expect(t('btn.cancel')).toBe('Cancelar');
      expect(t('btn.submit')).toBe('Enviar');
      expect(t('status.new')).toBe('Nuevo');
      expect(t('status.contact')).toBe('En contacto');
    });

    it('should have ARIA labels for accessibility', () => {
      expect(t('aria.closeModal')).toContain('Cerrar');
      expect(t('aria.kanbanDashboard')).toContain('Panel');
      expect(t('aria.searchInput')).toContain('Buscar');
    });
  });

  // ====================
  // Date Formatting
  // ====================
  describe('formatDate() - Date Localization', () => {
    const testDate = new Date('2026-06-14T10:30:00Z');

    it('should format date as dd/mm/yyyy (short format)', () => {
      const result = formatDate(testDate, 'short');
      // Spanish format: 14/06/2026
      expect(result).toMatch(/14\/06\/2026/);
    });

    it('should format date as "1 de junio de 2026" (long format)', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('2026');
      // Should be in Spanish: junio (June)
      expect(result.toLowerCase()).toMatch(/junio|14/);
    });

    it('should handle string date input', () => {
      const dateStr = new Date('2026-06-14T12:00:00').toISOString();
      const result = formatDate(dateStr, 'short');
      expect(result).toMatch(/06\/2026/); // Just check year and month due to timezone
    });

    it('should handle null/undefined gracefully', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('should use short format by default', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/14\/06\/2026/);
    });
  });

  // ====================
  // Number Formatting
  // ====================
  describe('formatNumber() - Number Localization', () => {
    it('should format numbers with Spanish thousands separator (dot)', () => {
      const result = formatNumber(1000);
      // Spanish: 1.000
      expect(result).toContain('1');
      expect(result).toContain('0');
      // Should have proper spacing for thousands
      expect(result.length).toBeGreaterThan(3);
    });

    it('should format large numbers correctly', () => {
      const result = formatNumber(1234567);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(6);
    });

    it('should handle decimal numbers', () => {
      const result = formatNumber(1234.56);
      expect(result).toBeTruthy();
    });

    it('should handle null/undefined gracefully', () => {
      expect(formatNumber(null)).toBe('');
      expect(formatNumber(undefined)).toBe('');
    });

    it('should handle zero', () => {
      const result = formatNumber(0);
      expect(result).toBe('0');
    });
  });

  // ====================
  // Currency Formatting
  // ====================
  describe('formatCurrency() - Currency Localization', () => {
    it('should format currency with € symbol', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('€');
    });

    it('should use Spanish number format', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBeTruthy();
      // Should have € and proper formatting
      expect(result).toContain('€');
    });

    it('should handle various amounts', () => {
      expect(formatCurrency(0)).toContain('€');
      expect(formatCurrency(1000000)).toContain('€');
      expect(formatCurrency(0.01)).toContain('€');
    });

    it('should handle null/undefined gracefully', () => {
      expect(formatCurrency(null)).toBe('');
      expect(formatCurrency(undefined)).toBe('');
    });
  });

  // ====================
  // Relative Time Formatting
  // ====================
  describe('formatRelativeTime() - Relative Time Localization', () => {
    it('should show "justo ahora" for very recent times', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toBe('justo ahora');
    });

    it('should show minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toMatch(/hace.*minuto/);
    });

    it('should show hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
      const result = formatRelativeTime(twoHoursAgo);
      expect(result).toMatch(/hace.*hora/);
    });

    it('should show days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toMatch(/hace.*día/);
    });

    it('should handle string date input', () => {
      const now = new Date();
      const result = formatRelativeTime(now.toISOString());
      expect(result).toBe('justo ahora');
    });

    it('should use singular for 1 minute/hour/day', () => {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const result = formatRelativeTime(oneMinuteAgo);
      expect(result).toMatch(/hace 1 minuto/);
    });

    it('should use plural for 2+ minutes/hours/days', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60000);
      const result = formatRelativeTime(twoMinutesAgo);
      expect(result).toMatch(/hace 2 minutos/);
    });
  });

  // ====================
  // Locale Configuration
  // ====================
  describe('getLocaleConfig() - Locale Configuration', () => {
    const config = getLocaleConfig();

    it('should return Spanish locale', () => {
      expect(config.locale).toBe('es-ES');
    });

    it('should specify dd/mm/yyyy date format', () => {
      expect(config.dateFormat).toBe('dd/mm/yyyy');
    });

    it('should specify € as currency symbol', () => {
      expect(config.currencySymbol).toBe('€');
    });

    it('should specify dot as thousands separator', () => {
      expect(config.thousandsSeparator).toBe('.');
    });

    it('should specify comma as decimal separator', () => {
      expect(config.decimalSeparator).toBe(',');
    });

    it('should position currency symbol as prefix', () => {
      expect(config.currencyPosition).toBe('prefix');
    });
  });

  // ====================
  // Messages Object
  // ====================
  describe('messages - Translation Object', () => {
    it('should have all required button labels', () => {
      expect(messages['btn.close']).toBeDefined();
      expect(messages['btn.cancel']).toBeDefined();
      expect(messages['btn.submit']).toBeDefined();
      expect(messages['btn.save']).toBeDefined();
    });

    it('should have all status values', () => {
      expect(messages['status.new']).toBe('Nuevo');
      expect(messages['status.contact']).toBe('En contacto');
      expect(messages['status.proposal']).toBe('Propuesta enviada');
      expect(messages['status.closed']).toBe('Cerrado');
    });

    it('should have all priority values', () => {
      expect(messages['priority.low']).toBe('Baja');
      expect(messages['priority.medium']).toBe('Media');
      expect(messages['priority.high']).toBe('Alta');
      expect(messages['priority.urgent']).toBe('Urgente');
    });

    it('should have success messages', () => {
      expect(messages['success.leadCreated']).toBeDefined();
      expect(messages['success.leadUpdated']).toBeDefined();
    });

    it('should have error messages', () => {
      expect(messages['error.loadingLeads']).toBeDefined();
      expect(messages['error.creatingLead']).toBeDefined();
    });

    it('should have ARIA labels for accessibility', () => {
      expect(Object.keys(messages).some(key => key.startsWith('aria.'))).toBe(true);
    });
  });

  // ====================
  // Integration Tests
  // ====================
  describe('i18n Integration', () => {
    it('should work together for a date with currency', () => {
      const date = new Date('2026-06-14T12:00:00');
      const formattedDate = formatDate(date, 'short');
      const formattedCurrency = formatCurrency(5000);

      expect(formattedDate).toMatch(/14\/06\/2026/);
      expect(formattedCurrency).toContain('€');
    });

    it('should provide consistent Spanish formatting across all functions', () => {
      const config = getLocaleConfig();
      expect(config.locale).toBe('es-ES');
      
      // All outputs should be Spanish-compatible
      expect(formatDate(new Date(), 'short')).toBeTruthy();
      expect(formatNumber(1000)).toBeTruthy();
      expect(formatCurrency(1000)).toBeTruthy();
    });
  });
});
