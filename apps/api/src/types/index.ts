/**
 * Types Barrel Export
 * Centralizes all type definitions
 * 
 * Created: 2026-03-11
 */

export * from './express';

// Re-export common Prisma types for convenience
export type {
  User,
  Wallet,
  Project,
  JourneyProgress,
  AgentSession,
  ChatMessage,
  AgentType,
  UserRole,
  ProjectStatus,
  JourneyPhase,
  ArtifactType,
} from '@prisma/client';

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common entity types
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface Identifiable {
  id: string;
}
