import { z } from 'zod';

// =============================================================================
// String Validation
// =============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// Solana Validation
// =============================================================================

export function isValidSolanaAddress(address: string): boolean {
  // Base58 encoded, 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

export function isValidSolanaPrivateKey(key: string): boolean {
  // Base58 encoded, 64 bytes = 88 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
  
  // Or JSON array format
  if (key.startsWith('[') && key.endsWith(']')) {
    try {
      const arr = JSON.parse(key);
      return Array.isArray(arr) && arr.length === 64;
    } catch {
      return false;
    }
  }
  
  return base58Regex.test(key);
}

// =============================================================================
// Input Sanitization
// =============================================================================

export function sanitizeString(input: string, maxLength: number = 10000): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxLength?: number
): T {
  const sanitized = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value, maxLength);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>, maxLength);
    }
  }
  
  return sanitized;
}

// =============================================================================
// Zod Schemas
// =============================================================================

export const Schemas = {
  walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address'),
  
  email: z.string().email('Invalid email address'),
  
  uuid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 'Invalid UUID'),
  
  passLevel: z.enum(['STARTER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']),
  
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  
  nftMetadata: z.object({
    name: z.string().min(1).max(100),
    symbol: z.string().min(1).max(10),
    description: z.string().min(1).max(1000),
    image: z.string().url(),
    attributes: z.array(z.object({
      trait_type: z.string(),
      value: z.union([z.string(), z.number()]),
    })),
  }),
};

// =============================================================================
// Validation Result Type
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Number Validation
// =============================================================================

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
