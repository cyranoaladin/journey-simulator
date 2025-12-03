import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSiwsChallenge } from '@/server/siwsStore'

const Body = z
    .object({
        address: z.string().min(20).optional(), // hint, pas obligatoire
    })
    .optional()

export async function POST(req: Request) {
    const json = await req.json().catch(() => null)
    const parsed = Body.safeParse(json)

    const addressHint = parsed.success && parsed.data?.address ? parsed.data.address : undefined
    const challenge = await createSiwsChallenge(addressHint)

    return NextResponse.json({
        challengeId: challenge.id,
        message: challenge.message,
        nonce: challenge.nonce,
        expiresAt: new Date(challenge.expiresAt).toISOString(),
    })
}
