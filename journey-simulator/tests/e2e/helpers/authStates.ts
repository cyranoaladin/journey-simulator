/**
 * Phase 4 — Auth States Helper
 * Creates distinct auth states for multi-user isolation testing
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';
const FRONTEND_URL = 'http://127.0.0.1:3000';
const REPO_ROOT = path.resolve(process.cwd(), '..');
const AUTH_DIR = path.resolve(REPO_ROOT, 'journey-simulator', 'test-results', '.auth');

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

    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        if (error.response?.data?.message?.includes('already exists') || error.response?.status === 409) {
            console.log(`ℹ️  User already exists: ${user.email}, attempting login`);
        } else {

            console.error(`⚠️  Registration failed for ${user.email}: ${error.message}`);
            throw error; // Don't swallow errors; fail fast to avoid 401 later
        }
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

        const safeFilename = path.basename(filename);
        const authPath = path.join(AUTH_DIR, safeFilename);
        if (!authPath.startsWith(AUTH_DIR)) {
            throw new Error('Auth state path must remain inside AUTH_DIR');
        }
        fs.writeFileSync(authPath, JSON.stringify(authState, null, 2), 'utf-8');

        console.log(`✅ Auth state saved: ${safeFilename}`);
    } catch (error: any) {
        console.error('❌ Login failed', {
            email: user.email,
            error: error?.response?.data ?? error?.message ?? error,
        });
        throw error;
    }
}
