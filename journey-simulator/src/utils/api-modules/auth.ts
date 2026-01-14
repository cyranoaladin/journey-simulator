/**
 * Project: Money Factory AI (MFAI)
 * Module: Authentication API
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { request, executeRequest, LoginResponse, RegisterResponse } from './base';
/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { } from './base'; // Or remove line if empty
import { tokenStore } from '../tokenStore';
import { logger } from '../logger';

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    wallet_address: string;
    persona: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        return request<LoginResponse>('/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        }, false);
    },

    getWalletChallenge: async (wallet_address: string): Promise<{ success: boolean; message: string; nonce: string }> => {
        return request<{ success: boolean; message: string; nonce: string }>('/user/wallet-challenge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet_address }),
        }, false);
    },

    loginWithWallet: async (wallet_address: string, signature?: string, message?: string): Promise<LoginResponse> => {
        return request<LoginResponse>('/user/login-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet_address, signature, message }),
        }, false);
    },

    register: async (userData: RegisterPayload): Promise<RegisterResponse> => {
        return request<RegisterResponse>('/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        }, false);
    },

    logout: async (): Promise<void> => {
        const refreshToken = tokenStore.getRefreshToken();
        if (refreshToken) {
            try {
                await request<void>('/user/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                }, false);
            } catch (error) {
                logger.error('Logout error:', error);
            }
        }
    },

    refreshToken: async (): Promise<{ accessToken: string; refreshToken?: string }> => {
        const refreshToken = tokenStore.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        return request<{ accessToken: string; refreshToken?: string }>('/user/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        }, false);
    },

    verifyToken: async (): Promise<{ user: LoginResponse['user'] }> => {
        return executeRequest<{ user: LoginResponse['user'] }>('/user/profile', {
            method: 'GET'
        });
    },

    getUserProfile: async (): Promise<LoginResponse['user']> => {
        return executeRequest<LoginResponse['user']>('/user/profile', {
            method: 'GET'
        });
    },

    updateUserProfile: async (userData: Partial<LoginResponse['user']>): Promise<LoginResponse['user']> => {
        return executeRequest<LoginResponse['user']>('/user/update-profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },
};
