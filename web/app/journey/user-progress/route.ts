import { NextRequest, NextResponse } from 'next/server'

let progress = {
  total_xp: 0,
  completed_phases: 0,
  nft_certificates: [] as any[],
  token_transactions: { mfai_tokens: 0 },
  persona: 'developer',
  subscription: false as const,
}

export async function GET(){
  return NextResponse.json({ success: true, progress })
}

export async function PUT(req: NextRequest){
  const json = await req.json().catch(()=>null) as any
  if(json && typeof json === 'object'){
    if (typeof json.total_xp === 'number') progress.total_xp = json.total_xp
    if (typeof json.completed_phases === 'number') progress.completed_phases = json.completed_phases
  }
  return NextResponse.json({ ok: true })
}
