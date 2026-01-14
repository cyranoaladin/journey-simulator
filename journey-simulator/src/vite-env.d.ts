/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RESOURCE_LIBRARY_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
