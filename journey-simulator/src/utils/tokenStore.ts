type NullableString = string | null;

let inMemoryAccessToken: NullableString = null;

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
const REFRESH_TOKEN_LOCAL_KEY = 'refreshToken';

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
    return safeLocalStorage.getItem(REFRESH_TOKEN_LOCAL_KEY);
  },

  setRefreshToken(token: NullableString) {
    if (!token) {
      safeLocalStorage.removeItem(REFRESH_TOKEN_LOCAL_KEY);
      return;
    }
    safeLocalStorage.setItem(REFRESH_TOKEN_LOCAL_KEY, token);
  },

  clearTokens() {
    inMemoryAccessToken = null;
    safeSessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
    safeLocalStorage.removeItem(REFRESH_TOKEN_LOCAL_KEY);
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
