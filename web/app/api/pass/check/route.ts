import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPassOnChain } from '@/lib/solana/checkPassOnChain';

const PASS_COLLECTION_MINT = process.env.NEXT_PUBLIC_PASS_COLLECTION_MINT;

export async function POST(req: NextRequest) {
    try {
        const { walletAddress } = await req.json();

        if (!walletAddress) {
            return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
        }

        if (!PASS_COLLECTION_MINT) {
            console.warn('PASS_COLLECTION_MINT not set, skipping on-chain check');
            return NextResponse.json({ hasPass: false, passes: [] });
        }

        // 1. Check DB Cache
        const wallet = await prisma.wallet.findUnique({
            where: { address: walletAddress },
            include: { nftPasses: true }
        });

        const now = new Date();
        const maxAgeMs = 5 * 60 * 1000; // 5 minutes cache

        if (
            wallet?.hasActivePass &&
            wallet.lastPassCheck &&
            now.getTime() - wallet.lastPassCheck.getTime() < maxAgeMs
        ) {
            return NextResponse.json({
                hasPass: true,
                passes: wallet.nftPasses.map(p => ({ mint: p.mintAddress, tier: p.tier }))
            });
        }

        // 2. Verify On-Chain (DAS API)
        const passes = await checkPassOnChain(walletAddress, PASS_COLLECTION_MINT);
        const hasPass = passes.length > 0;

        // 3. Update DB
        await prisma.$transaction(async (tx) => {
            // Upsert Wallet
            const userWallet = await tx.wallet.upsert({
                where: { address: walletAddress },
                update: {
                    hasActivePass: hasPass,
                    lastPassCheck: now
                },
                create: {
                    address: walletAddress,
                    chain: 'solana',
                    hasActivePass: hasPass,
                    lastPassCheck: now,
                    user: {
                        create: {} // Create anonymous user if not exists
                    }
                }
            });

            // Upsert NftPasses
            for (const pass of passes) {
                await tx.nftPass.upsert({
                    where: { mintAddress: pass.mint },
                    update: {
                        tier: pass.tier,
                        collectionMint: PASS_COLLECTION_MINT,
                        isActive: true,
                        lastCheckedAt: now
                    },
                    create: {
                        walletId: userWallet.id,
                        mintAddress: pass.mint,
                        collectionMint: PASS_COLLECTION_MINT,
                        tier: pass.tier,
                        isActive: true
                    }
                });
            }
        });

        return NextResponse.json({ hasPass, passes });

    } catch (error) {
        console.error('Pass check error:', error);
        return NextResponse.json({ error: 'Failed to check pass' }, { status: 500 });
    }
}
