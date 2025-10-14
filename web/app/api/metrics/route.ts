import { NextResponse } from 'next/server'
import { getMetrics } from '@/server/metrics'

export async function GET(){
  return NextResponse.json({ ok: true, metrics: getMetrics(), time: new Date().toISOString() })
}