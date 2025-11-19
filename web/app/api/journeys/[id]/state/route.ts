import { NextRequest, NextResponse } from 'next/server'
import { getJourneyState } from '@/server/state'

export async function GET(req: NextRequest, ctx: { params: { id: string } }){
  const idParam = ctx.params.id
  const url = new URL(req.url)
  const userIdParam = url.searchParams.get('userId') || undefined
  const state = await getJourneyState(idParam)
  if(!state) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if(userIdParam && state.userId && state.userId !== userIdParam){
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ id: idParam, ...state })
}
