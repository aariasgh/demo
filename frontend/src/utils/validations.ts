/**
 * Frontend validation schemas using Zod
 * These schemas mirror backend validation (E2-S1) for type safety and consistency
 */

import { z } from 'zod';

/**
 * LeadCreateSchema: Validates form data for lead creation
 * Must match backend schema exactly (see backend/app/schemas/lead.py)
 */
export const LeadCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(255, 'Máximo 255 caracteres')
    .describe('Lead name (required)'),

  company: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(255, 'Máximo 255 caracteres')
    .describe('Company name (required)'),

  email: z
    .string()
    .email('El formato de email no es válido. Verifica que no contenga caracteres especiales como &, *, !, etc.')
    .max(255, 'Máximo 255 caracteres')
    .describe('Email address (required, must be unique)'),

  phone: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .nullable()
    .describe('Phone number (optional)'),

  notes: z
    .string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .nullable()
    .describe('Additional notes (optional, max 1000 chars)'),
});

/**
 * Infer TypeScript type from Zod schema for type safety
 */
export type LeadCreateFormData = z.infer<typeof LeadCreateSchema>;

/**
 * Get character count for counter display
 */
export const getCharacterCount = (text: string | null | undefined): number => {
  return text?.length ?? 0;
};

/**
 * Check if character count exceeds limit
 */
export const exceedsCharLimit = (text: string | null | undefined, limit: number): boolean => {
  return (text?.length ?? 0) > limit;
};

/**
 * Detect invalid characters in email
 * Returns array of invalid characters found
 */
export const getInvalidEmailCharacters = (email: string): string[] => {
  // RFC 5322 compliant email - only these special chars are allowed in local part
  // Allowed: . ! # $ % & ' * + - / = ? ^ _ ` { | } ~
  // But in practice, most email providers are stricter
  // Invalid for most email providers: & * ! ^ ~ ` { } | and spaces
  const invalidChars = new Set<string>();
  const forbiddenChars = ['&', '*', '!', '^', '~', '`', '{', '}', '|', ' ', '<', '>', '(', ')', '[', ']', ',', ';', ':'];
  
  for (const char of email) {
    if (forbiddenChars.includes(char)) {
      invalidChars.add(char);
    }
  }
  
  return Array.from(invalidChars);
};
