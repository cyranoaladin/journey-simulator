import { NextResponse } from 'next/server'
import { z } from 'zod'
import { signBase64Transaction } from '@/server/signer'
import { Connection, Keypair, Transaction, SystemProgram, PublicKey } from '@solana/web3.js'

const Body = z.object({
  sim: z.object({
    ok: z.boolean(),
    estFeeLamports: z.number(),
    riskScore: z.number(),
    network: z.string(),
    // For MVP, we pass the recipient and amount in the sim object or body
    // In a real app, 'sim' would contain a serialized unsigned tx or instructions
    recipient: z.string().optional(),
  }),
})

export async function POST(req: Request) {
  if (process.env.KILL_SWITCH === '1')
    return NextResponse.json({ error: 'killswitch' }, { status: 403 })
  if (!process.env.MINTER_SECRET_KEY)
    return NextResponse.json({ error: 'minter_key_missing' }, { status: 400 })

  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { recipient, network } = parsed.data.sim

  // If no recipient provided, we can't mint/send
  if (!recipient) {
    return NextResponse.json({ error: 'missing_recipient' }, { status: 400 })
  }

  try {
    // 1. Connect to Solana
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // 2. Build a simple transaction (Transfer SOL or Mint Token)
    // For this P0 fix, we will implement a SOL transfer as a "Proof of Reward"
    // In P1/P2 this will be replaced by the real Candy Machine minting we designed
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: Keypair.fromSecretKey(
          require('bs58').decode(process.env.MINTER_SECRET_KEY)
        ).publicKey,
        toPubkey: new PublicKey(recipient),
        lamports: 1000, // Micro-reward (0.000001 SOL) to prove on-chain activity
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = Keypair.fromSecretKey(
      require('bs58').decode(process.env.MINTER_SECRET_KEY)
    ).publicKey;

    // 3. Serialize and Sign using our secure server signer
    const serializedTx = transaction.serialize({ requireAllSignatures: false }).toString('base64');
    const signature = await signBase64Transaction(serializedTx);

    // 4. Send to network
    // Note: signBase64Transaction returns the signature, but we need the signed tx to send
    // Re-signing here for simplicity since we have the key in this scope (env)
    // In a split architecture, the signer would return the signed TX.
    // Let's use the key directly here since we are in the secure context.

    transaction.sign(Keypair.fromSecretKey(
      require('bs58').decode(process.env.MINTER_SECRET_KEY)
    ));

    const txSig = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(txSig);

    // 5. Log to DB
    try {
      const { prisma } = await import('@/lib/prisma');
      const userId = req.headers.get('x-user-id');
      await prisma.mintLog.create({
        data: {
          spec: parsed.data.sim,
          signature: txSig,
          network: network,
          userId: userId ?? null,
        }
      });
    } catch (e) {
      console.warn('Failed to log mint to DB', e);
    }

    return NextResponse.json({ ok: true, tx: { txSig } })

  } catch (executionError) {
    console.error('Failed to execute reward transaction', executionError)
    return NextResponse.json({ error: 'execute_failed', details: String(executionError) }, { status: 500 })
  }
}
