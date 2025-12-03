import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { cookies } from 'next/headers';

// Simple JWT-like session implementation for MVP
// In production, use a real auth library like NextAuth or IronSession
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me-in-prod';

function signSession(payload: any) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${signature}`;
}

export async function POST(req: NextRequest) {
    try {
        const { walletAddress, signature, nonce } = await req.json();

        if (!walletAddress || !signature || !nonce) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify Signature
        try {
            const message = `Sign this message to login to Money Factory AI.\nNonce: ${nonce}`;
            const messageBytes = new TextEncoder().encode(message);
            const signatureBytes = bs58.decode(signature);
            const publicKeyBytes = bs58.decode(walletAddress);

            const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

            if (!verified) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        } catch (err) {
            console.error('Verification error:', err);
            return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
        }

        // 2. Find or Create User & Wallet in DB
        // We use a transaction to ensure consistency
        const user = await prisma.$transaction(async (tx) => {
            // Check if wallet exists
            let wallet = await tx.wallet.findUnique({
                where: { address: walletAddress },
                include: { user: true }
            });

            if (!wallet) {
                // Create new user and wallet
                // We create a user with no email initially, just linked to wallet
                const newUser = await tx.user.create({
                    data: {
                        wallets: {
                            create: {
                                address: walletAddress,
                                chain: 'solana'
                            }
                        }
                    },
                    include: {
                        wallets: true
                    }
                });
                return newUser;
            }

            return wallet.user;
        });

        // 3. Create Session (Cookie)
        const sessionToken = signSession({
            userId: user.id,
            walletAddress: walletAddress,
            exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        cookies().set('mfai_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, wallet: walletAddress }
        });

    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
