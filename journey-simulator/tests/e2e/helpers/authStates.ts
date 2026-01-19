/**
 * Phase 4 — Auth States Helper
 * Creates distinct auth states for multi-user isolation testing
 */

import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';
const FRONTEND_URL = 'http://127.0.0.1:3000';
const AUTH_DIR = path.join(process.cwd(), 'test-results', '.auth');

interface User {
    email: string;
    password: string;
    name: string;
}

/**
 * Create two distinct users for isolation testing
 */
export async function createDualAuthStates(): Promise<{ userA: User; userB: User }> {
    // Ensure auth directory exists
    fs.mkdirSync(AUTH_DIR, { recursive: true });

    const uniqueSuffix = Date.now();
    const userA: User = {
        email: `testA_${uniqueSuffix}@mfai.app`,
        password: 'MFAITestA2026!',
        name: `Test User A ${uniqueSuffix}`,
    };

    const userB: User = {
        email: `testB_${uniqueSuffix}@mfai.app`,
        password: 'MFAITestB2026!',
        name: `Test User B ${uniqueSuffix}`,
    };

    // Register/login userA
    await ensureUserAndLogin(userA, 'userA.json');

    // Wait to prevent Rate Limiting (429) on dual creation
    await new Promise(r => setTimeout(r, 2000));

    // Register/login userB
    await ensureUserAndLogin(userB, 'userB.json');

    return { userA, userB };
}

/**
 * Ensure user exists and create auth state
 */
async function ensureUserAndLogin(user: User, filename: string): Promise<void> {
    // Cleanup existing user to ensure fresh state
    try {
        await axios.post(`${API_URL}/auth/test-cleanup`, { email: user.email });
        console.log(`🧹 Cleaned up ${user.email}`);
    } catch (e) {
        // Ignore cleanup errors
    }

    try {
        // Register new user
        await axios.post(`${API_URL}/user/register`, {
            name: user.name,
            email: user.email,
            password: user.password,
            wallet_address: `TEST_WALLET_${user.email}`,
            persona: 'cognitive-activation-hub',
        });
        console.log(`✅ Registered ${user.email}`);
    } catch (error: any) {
        console.log(`⚠️  Registration failed for ${user.email}: ${error.message}`);
        // Even if registration fails (unlikely after cleanup), try login
    }

    // Login
    try {
        const loginResponse = await axios.post(`${API_URL}/user/login`, {
            email: user.email,
            password: user.password,
        });

        const { accessToken, refreshToken } = loginResponse.data;

        // Save auth state
        const authState = {
            cookies: [],
            origins: [
                {
                    origin: FRONTEND_URL,
                    localStorage: [
                        {
                            name: 'accessToken',
                            value: accessToken,
                        },
                        {
                            name: 'refreshToken',
                            value: refreshToken,
                        },
                        {
                            name: 'mfai_token',
                            value: accessToken,
                        },
                        {
                            name: 'mfai-run-mode',
                            value: 'real',
                        },
                        {
                            name: 'user',
                            value: JSON.stringify({
                                email: user.email,
                                name: user.name,
                            }),
                        },
                    ],
                },
            ],
        };

        const authPath = path.join(AUTH_DIR, filename);
        fs.writeFileSync(authPath, JSON.stringify(authState, null, 2), 'utf-8');

        console.log(`✅ Auth state saved: ${authPath}`);
    } catch (error: any) {
        console.error(`❌ Login failed for ${user.email}:`, error.response?.data || error.message);
        throw error;
    }
}
