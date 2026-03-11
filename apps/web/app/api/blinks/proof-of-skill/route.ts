/**
 * Solana Blinks (Actions) - Proof-of-Skill Mint Endpoint
 * Implements Solana Actions specification for cross-platform NFT minting
 * 
 * Created: 2026-03-11
 * Spec: https://github.com/solana-labs/solana-improvement-documents/pull/69
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Blinks/Actions response types
interface ActionGetResponse {
  type: 'action'
  icon: string
  title: string
  description: string
  label: string
  disabled?: boolean
  links?: {
    actions: Array<{
      label: string
      href: string
      parameters?: Array<{
        name: string
        label: string
        required?: boolean
      }>
    }>
  }
  error?: ActionError
}

interface ActionPostRequest {
  account: string
  params?: Record<string, string>
}

interface ActionPostResponse {
  type: 'transaction'
  transaction: string // base64 encoded transaction
  message?: string
}

interface ActionError {
  message: string
}

// Validation schemas
const SkillProofSchema = z.object({
  skill: z.string().min(1),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  projectName: z.string().optional(),
  description: z.string().optional(),
})

/**
 * GET /api/blinks/proof-of-skill
 * Returns the Blink metadata (UI for wallets to display)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const response: ActionGetResponse = {
      type: 'action',
      icon: 'https://mfai.app/icons/proof-of-skill.png',
      title: 'Mint Proof-of-Skill NFT',
      description: 'Mint an on-chain credential verifying your Web3 skill achievement. Skills are verified through the Money Factory AI platform.',
      label: 'Mint Credential',
      links: {
        actions: [
          {
            label: 'Mint Beginner Credential',
            href: '/api/blinks/proof-of-skill?skill=WEB3_BASICS&level=BEGINNER',
          },
          {
            label: 'Mint with Custom Skill',
            href: '/api/blinks/proof-of-skill',
            parameters: [
              {
                name: 'skill',
                label: 'Skill Name (e.g., Smart Contract Dev)',
                required: true,
              },
              {
                name: 'level',
                label: 'Level (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT)',
                required: true,
              },
              {
                name: 'projectName',
                label: 'Project Name (optional)',
                required: false,
              },
            ],
          },
        ],
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('[Blinks GET] Error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to load Blink metadata' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/blinks/proof-of-skill
 * Creates and returns the mint transaction
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: ActionPostRequest = await req.json()
    
    // Validate account (wallet address)
    if (!body.account) {
      return NextResponse.json(
        { error: { message: 'Wallet account required' } },
        { status: 400 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const skill = searchParams.get('skill') || body.params?.skill
    const level = searchParams.get('level') || body.params?.level
    const projectName = searchParams.get('projectName') || body.params?.projectName

    // Validate required fields
    if (!skill || !level) {
      return NextResponse.json(
        { error: { message: 'Skill and level are required' } },
        { status: 400 }
      )
    }

    // Validate skill data
    const validation = SkillProofSchema.safeParse({
      skill,
      level,
      projectName,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: { message: 'Invalid skill data: ' + validation.error.message } },
        { status: 400 }
      )
    }

    // For now, return a message that minting should happen through main platform
    // Full implementation would integrate with existing mint queue
    const response: ActionPostResponse = {
      type: 'transaction',
      transaction: '', // Would be populated with actual transaction
      message: `Please visit https://mfai.app/journey to mint your ${skill} (${level}) credential after completing the required phase.`,
    }

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('[Blinks POST] Error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to create transaction: ' + (error as Error).message } },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
