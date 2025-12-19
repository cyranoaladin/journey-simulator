type NullableString = string | null;

let inMemoryAccessToken: NullableString = null;

let inMemoryRefreshToken: NullableString = null;

const safeSessionStorage = {
  getItem(key: string): NullableString {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return null;
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      window.sessionStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem(key: string) {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      window.sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const safeLocalStorage = {
  getItem(key: string): NullableString {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem(key: string) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const ACCESS_TOKEN_SESSION_KEY = 'accessToken';
const ACCESS_TOKEN_LEGACY_LOCAL_KEY = 'accessToken';
const REFRESH_TOKEN_SESSION_KEY = 'refreshToken';
const REFRESH_TOKEN_LEGACY_LOCAL_KEY = 'refreshToken';

const shouldPersistRefreshToken = (): boolean => {
  try {
    return (import.meta as any)?.env?.VITE_PERSIST_REFRESH_TOKEN === 'true';
  } catch {
    return false;
  }
};

export const tokenStore = {
  /**
   * Access token: in-memory first, then sessionStorage.
   * Rationale: reduce XSS blast radius vs localStorage while keeping reload support in same tab.
   */
  getAccessToken(): NullableString {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    const fromSession = safeSessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY);
    if (fromSession) {
      inMemoryAccessToken = fromSession;
      return fromSession;
    }
    return null;
  },

  setAccessToken(token: NullableString) {
    inMemoryAccessToken = token;
    if (!token) {
      safeSessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
      return;
    }
    safeSessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, token);
  },

  getRefreshToken(): NullableString {
    if (inMemoryRefreshToken) return inMemoryRefreshToken;

    const fromSession = safeSessionStorage.getItem(REFRESH_TOKEN_SESSION_KEY);
    if (fromSession) {
      inMemoryRefreshToken = fromSession;
      return fromSession;
    }

    // Legacy: refreshToken used to be stored in localStorage. Migrate to sessionStorage by default.
    const legacy = safeLocalStorage.getItem(REFRESH_TOKEN_LEGACY_LOCAL_KEY);
    if (!legacy) return null;

    if (shouldPersistRefreshToken()) {
      // Explicit opt-in: keep legacy persistence (higher XSS blast radius).
      inMemoryRefreshToken = legacy;
      return legacy;
    }

    // Default: move to sessionStorage (reduces persistence + limits multi-tab exposure).
    inMemoryRefreshToken = legacy;
    safeSessionStorage.setItem(REFRESH_TOKEN_SESSION_KEY, legacy);
    safeLocalStorage.removeItem(REFRESH_TOKEN_LEGACY_LOCAL_KEY);
    return legacy;
  },

  setRefreshToken(token: NullableString) {
    if (!token) {
      inMemoryRefreshToken = null;
      safeSessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
      safeLocalStorage.removeItem(REFRESH_TOKEN_LEGACY_LOCAL_KEY);
      return;
    }

    inMemoryRefreshToken = token;
    if (shouldPersistRefreshToken()) {
      safeLocalStorage.setItem(REFRESH_TOKEN_LEGACY_LOCAL_KEY, token);
      return;
    }

    safeSessionStorage.setItem(REFRESH_TOKEN_SESSION_KEY, token);
  },

  clearTokens() {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    safeSessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
    safeSessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
    safeLocalStorage.removeItem(REFRESH_TOKEN_LEGACY_LOCAL_KEY);
    // Also clear legacy access token if it still exists
    safeLocalStorage.removeItem(ACCESS_TOKEN_LEGACY_LOCAL_KEY);
  },

  /**
   * Migration: if an old accessToken exists in localStorage, move it to sessionStorage.
   * This keeps existing sessions working after the storage hardening.
   */
  migrateLegacyAccessToken() {
    const legacy = safeLocalStorage.getItem(ACCESS_TOKEN_LEGACY_LOCAL_KEY);
    const existingSession = safeSessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY);
    if (!legacy) return;
    if (!existingSession) {
      this.setAccessToken(legacy);
    }
    safeLocalStorage.removeItem(ACCESS_TOKEN_LEGACY_LOCAL_KEY);
  },
};
