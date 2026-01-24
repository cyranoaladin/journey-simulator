/**
 * Project: Money Factory AI (MFAI)
 * Module: API Base & Core Networking
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { logger } from '../logger';
import { tokenStore } from '../tokenStore';
import { DemoStateManager, handleDemoRequest } from '../apiDemoHandlers';

// --- Configuration ---

function normalizeApiBaseUrl(input: string): string {
    let url = input.replace(/\/+$/, '');
    url = url.replace(/\/api$/i, '');
    return url;
}

function isLocalUiHost(): boolean {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
}

function resolveApiBaseUrl(): string {
    const configured = import.meta.env.VITE_API_BASE_URL;
    const normalizedConfigured = configured ? normalizeApiBaseUrl(configured) : null;

    if (isLocalUiHost()) {
        if (normalizedConfigured && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedConfigured)) {
            return normalizedConfigured;
        }
        return 'http://127.0.0.1:3001';
    }

    return normalizedConfigured || 'https://journey.mfai.app';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const SOLANA_API_BASE_URL =
    import.meta.env.VITE_SOLANA_API_BASE_URL || 'http://127.0.0.1:3001';


/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// api-modules/base.ts ---

// --- Interfaces ---

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}

export interface LoginResponse {
    success: boolean;
    user: {
        id: string;
        name: string;
        email: string;
        role: 'admin' | 'user';
        wallet_address: string;
        persona?: 'student' | 'entrepreneur' | 'developer' | 'creator' | 'cognitive-activation-hub';
        total_xp?: number;
        current_level?: number;
        completed_phases?: number;
        subscription?: 'gold' | 'platinum' | 'diamond' | false;
        is_active?: boolean;
    };
    accessToken: string;
    refreshToken: string;
    message?: string;
}

export interface RegisterResponse {
    success: boolean;
    user: LoginResponse['user'];
    accessToken: string;
    refreshToken: string;
    message?: string;
}

// --- Core Networking ---

// Avoid a "refresh stampede"
let refreshInFlight: Promise<Response> | null = null;

export const getAuthHeaders = () => {
    const token = tokenStore.getAccessToken();
    let mode = 'demo';
    if (typeof window !== 'undefined') {
        try {
            mode = window.localStorage.getItem('mfai-run-mode') || 'demo';
        } catch (e) {
            // Silently ignore localStorage access errors
        }
    }
    return {
        'Content-Type': 'application/json',
        'x-run-mode': mode,
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

// Helper function to handle API responses
export const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
            success: false,
            message: 'Network error occurred'
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// Helper: Demo Request Execution
const executeDemoRequest = async <T>(path: string, options: RequestInit): Promise<T | null> => {
    const token = tokenStore.getAccessToken();
    const isAIAgentCall = path.includes('/step') || path.includes('/submit');

    if (token === 'demo-token' && !isAIAgentCall) {
        logger.debug(`[Demo Mode] Mocking request to ${path}`);
        const stateManager = new DemoStateManager();
        const demoResponse = await handleDemoRequest<T>(path, options, stateManager);
        return demoResponse !== null ? demoResponse : ({ success: true } as unknown as T);
    }
    return null;
};

// Helper: Offline Fallback (Keep simplified for now, or move to separate file if huge)
// For brevity in this base file, I will keep just the signature and implement strictly if needed,
// but to respect complexity < 15, I should probably move offline logic too.
// For now, let's include the core request wrapper.

import { handleOfflineFallback } from './offline-fallback'; // We'll creating this next

// Helper: Token Refresh
const executeRefresh = async <T>(path: string, options: RequestInit): Promise<T> => {
    const storedRefreshToken = tokenStore.getRefreshToken();
    if (!storedRefreshToken) {
        throw new Error('Unauthorized and no refresh token available');
    }

    if (storedRefreshToken === 'demo-refresh-token') {
        tokenStore.setAccessToken('demo-token');
        const demoRes = await executeDemoRequest<T>(path, options);
        return demoRes || ({ success: true } as unknown as T);
    }

    if (!refreshInFlight) {
        refreshInFlight = fetch(`${API_BASE_URL}/user/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
        }).finally(() => {
            refreshInFlight = null;
        });
    }

    const refreshResp = await refreshInFlight;

    if (refreshResp.ok) {
        const refreshData = await refreshResp.json();
        if (refreshData?.accessToken) {
            tokenStore.setAccessToken(refreshData.accessToken);
        }
        if (refreshData?.refreshToken) {
            tokenStore.setRefreshToken(refreshData.refreshToken);
        }

        const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...getAuthHeaders(),
            },
        });
        return handleResponse<T>(retryResponse);
    }

    tokenStore.clearTokens();
    let errorMessage = 'Token refresh failed';
    try {
        const errorData = await refreshResp.json();
        if (errorData?.message) errorMessage = errorData.message;
    } catch (e) {
        // Silently ignore refresh error JSON parsing failures
    }
    throw new Error(errorMessage);
};

// Main Request Function
export const request = async <T>(
    path: string,
    options: RequestInit = {},
    retryOnUnauthorized: boolean = true
): Promise<T> => {
    logger.debug(`[API] Requesting: ${path} (Base: ${API_BASE_URL})`);

    const demoResult = await executeDemoRequest<T>(path, options);
    if (demoResult) return demoResult;

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            credentials: 'include',
            headers: {
                ...(options.headers || {}),
            },
        });
    } catch (networkError) {
        const fallback = await handleOfflineFallback<T>(path, networkError);
        if (fallback !== undefined) {
            return fallback;
        }
        throw networkError;
    }

    logger.debug(`[API] Response for ${path}: ${response.status}`);

    if (response.status === 401 && retryOnUnauthorized) {
        return executeRefresh<T>(path, options);
    }

    return handleResponse<T>(response);
};

// Generic execute wrapper for convenience
export const executeRequest = <T>(path: string, options: RequestInit = {}) => {
    return request<T>(path, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });
};
