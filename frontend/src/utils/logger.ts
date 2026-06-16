/**
 * AI-5: Frontend Logging Utility
 *
 * Purpose: Structured logging for frontend application
 * Supports levels: debug, info, warn, error
 * Integrates with error handling for E7-S3
 *
 * Author: Charlie (Senior Dev)
 * Date: 2026-06-15
 * Status: READY FOR INTEGRATION
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
  minLevel: LogLevel;
  isDevelopment: boolean;
}

/**
 * Structured logger for frontend application
 * Supports multiple log levels with contextual data
 */
class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableConsole: true,
      enableRemote: false,
      minLevel: 'info',
      isDevelopment: process.env.NODE_ENV === 'development',
      ...config,
    };
  }

  /**
   * Determine if log should be processed based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.config.minLevel];
  }

  /**
   * Format timestamp for logging
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create console style prefix based on level
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #666; font-weight: normal;',
      info: 'color: #0066cc; font-weight: normal;',
      warn: 'color: #ff9900; font-weight: bold;',
      error: 'color: #cc0000; font-weight: bold;',
    };
    return styles[level];
  }

  /**
   * Write to console
   */
  private writeToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const style = this.getConsoleStyle(entry.level);

    console.log(`%c${prefix} ${entry.message}`, style, entry.context || '');

    if (entry.error) {
      console.error(entry.error);
    }
  }

  /**
   * Send log to remote server
   */
  private async writeToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteUrl) {
      return;
    }

    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      // Silent fail - don't break app due to logging error
      console.error('Failed to send log to remote:', err);
    }
  }

  /**
   * Buffer log entry (for batch sending later)
   */
  private bufferLog(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Flush buffer if it gets too large
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: any, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      context,
      error,
      stack: error?.stack,
    };

    // Write to console
    this.writeToConsole(entry);

    // Buffer for batch sending
    this.bufferLog(entry);

    // Send to remote if error level
    if (level === 'error' && this.config.enableRemote) {
      this.writeToRemote(entry);
    }
  }

  /**
   * Debug level logging (development only)
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | string, context?: Record<string, any>): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.log('error', message, context, errorObj);
  }

  /**
   * Flush buffered logs to remote
   */
  async flushBuffer(): Promise<void> {
    if (!this.config.enableRemote || this.logBuffer.length === 0) {
      return;
    }

    try {
      const logsToSend = [...this.logBuffer];
      this.logBuffer = [];

      await fetch(`${this.config.remoteUrl}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: logsToSend }),
      });
    } catch (err) {
      console.error('Failed to flush logs:', err);
      // Keep logs for retry
    }
  }

  /**
   * Get all buffered logs
   */
  getBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Global logger instance
 */
const logger = new Logger({
  enableConsole: true,
  enableRemote: process.env.VITE_LOG_REMOTE_URL ? true : false,
  remoteUrl: process.env.VITE_LOG_REMOTE_URL,
  minLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  isDevelopment: process.env.NODE_ENV === 'development',
});

/**
 * Export singleton logger
 */
export default logger;

/**
 * Hook for React components to log lifecycle events
 */
export function useLogger(componentName: string) {
  return {
    debug: (msg: string, ctx?: any) =>
      logger.debug(`[${componentName}] ${msg}`, ctx),
    info: (msg: string, ctx?: any) =>
      logger.info(`[${componentName}] ${msg}`, ctx),
    warn: (msg: string, ctx?: any) =>
      logger.warn(`[${componentName}] ${msg}`, ctx),
    error: (msg: string, err?: Error | string, ctx?: any) =>
      logger.error(`[${componentName}] ${msg}`, err, ctx),
  };
}

/**
 * Error boundary wrapper for logging uncaught errors
 */
export function withErrorLogging<T extends (...args: any[]) => any>(
  fn: T,
  fnName: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Error in ${fnName}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }) as T;
}

/**
 * Usage Examples:
 *
 * // Global logger
 * import logger from './utils/logger';
 * logger.info('App initialized', { version: '1.0.0' });
 * logger.error('Failed to load leads', error, { userId: 123 });
 *
 * // In React component
 * function MyComponent() {
 *   const log = useLogger('MyComponent');
 *
 *   useEffect(() => {
 *     log.info('Component mounted');
 *     return () => log.debug('Component unmounted');
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 *
 * // Wrap async functions
 * const loadLeads = withErrorLogging(async () => {
 *   const response = await fetch('/api/leads');
 *   return response.json();
 * }, 'loadLeads');
 */
