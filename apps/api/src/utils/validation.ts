/**
 * Validation Utilities
 * Common validation functions used across the application
 * 
 * Created: 2026-03-11
 */

import { AgentType, UserRole, ProjectStatus } from '@prisma/client';

// ============================================
// String Validations
// ============================================

/**
 * Validates an email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  // Base58 encoded, 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Validates a UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================
// Enum Validations
// ============================================

const VALID_AGENT_TYPES: readonly AgentType[] = [
  'ZYNO_ORCHESTRATOR',
  'ARCHITECT_AGENT',
  'ENGINEER_AGENT',
  'CFO_AGENT',
  'LEGAL_AGENT',
  'MARKETING_AGENT',
  'AUDITOR_AGENT',
  'TOKENOMICS_AGENT',
  'GROWTH_AGENT',
  'GOVERNANCE_AGENT',
  'SECURITY_AGENT',
  'RESEARCH_AGENT',
  'UX_AGENT',
  'PRODUCT_AGENT',
  'COMMUNITY_AGENT',
  'MINTING_AGENT',
  'RAG_OPS_AGENT',
];

const VALID_USER_ROLES: readonly UserRole[] = ['FOUNDER', 'INVESTOR', 'ADMIN'];

const VALID_PROJECT_STATUSES: readonly ProjectStatus[] = [
  'DRAFT',
  'IN_PROGRESS',
  'AUDIT',
  'APPROVED',
  'LAUNCHED',
  'FAILED',
];

export function isValidAgentType(type: string): type is AgentType {
  return VALID_AGENT_TYPES.includes(type as AgentType);
}

export function isValidUserRole(role: string): role is UserRole {
  return VALID_USER_ROLES.includes(role as UserRole);
}

export function isValidProjectStatus(status: string): status is ProjectStatus {
  return VALID_PROJECT_STATUSES.includes(status as ProjectStatus);
}

// ============================================
// Input Sanitization
// ============================================

/**
 * Sanitizes a string input
 * - Trims whitespace
 * - Limits length
 * - Removes control characters
 */
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

/**
 * Sanitizes an object by applying sanitizeString to all string values
 */
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

// ============================================
// Numeric Validations
// ============================================

/**
 * Validates that a value is a positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Validates that a value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// ============================================
// Array Validations
// ============================================

/**
 * Validates that an array is not empty and has valid items
 */
export function isValidArray<T>(
  arr: unknown,
  itemValidator?: (item: T) => boolean
): arr is T[] {
  if (!Array.isArray(arr) || arr.length === 0) {
    return false;
  }
  
  if (itemValidator) {
    return arr.every(itemValidator);
  }
  
  return true;
}

// ============================================
// Request Validations
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a request body against required fields
 */
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

// ============================================
// Export all validation lists
// ============================================

export const Validations = {
  VALID_AGENT_TYPES,
  VALID_USER_ROLES,
  VALID_PROJECT_STATUSES,
};

export default {
  isValidEmail,
  isValidSolanaAddress,
  isValidUUID,
  isValidAgentType,
  isValidUserRole,
  isValidProjectStatus,
  sanitizeString,
  sanitizeObject,
  isPositiveInteger,
  isInRange,
  isValidArray,
  validateRequiredFields,
  Validations,
};
