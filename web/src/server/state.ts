type JourneyStateRecord = {
  journeyId: string
  last_state: any
  last_metadata?: any
  updatedAt: number
}

type AgentLog = {
  ts: number
  journeyId?: string
  userId?: string
  agent: string
  action: string
  details?: Record<string, any>
}

// Fallback in-memory store
const mem = {
  journeyStates: new Map<string, JourneyStateRecord>(),
  agentLogs: [] as AgentLog[],
}
const MAX_LOGS = 200

let forceMemory = process.env.STATE_DRIVER === 'memory'

async function dbAvailable(): Promise<boolean>{
  if(forceMemory) return false
  try{
    const { prisma } = (await import('@/server/db')) as any
    // probe minimal
    if(!prisma) return false
    return true
  }catch{
    return false
  }
}

export async function setJourneyState(journeyId: string, nextState: any, metadata?: any){
  try{
    if(await dbAvailable()){
      const { prisma } = (await import('@/server/db')) as any
      await prisma.journeyState.upsert({
        where: { journeyId },
        update: { last_state: nextState, last_metadata: metadata },
        create: { journeyId, last_state: nextState, last_metadata: metadata },
      })
      return
    }
  }catch{
    forceMemory = true
  }
  const rec: JourneyStateRecord = { journeyId, last_state: nextState, last_metadata: metadata, updatedAt: Date.now() }
  mem.journeyStates.set(journeyId, rec)
}

export async function getJourneyState(journeyId: string): Promise<JourneyStateRecord | null>{
  try{
    if(await dbAvailable()){
      const { prisma } = (await import('@/server/db')) as any
      const row = await prisma.journeyState.findUnique({ where: { journeyId } })
      if(!row) return null
      return { journeyId, last_state: row.last_state, last_metadata: row.last_metadata ?? undefined, updatedAt: new Date(row.updatedAt).getTime() }
    }
  }catch{
    forceMemory = true
  }
  return mem.journeyStates.get(journeyId) ?? null
}

export async function pushAgentLog(log: AgentLog){
  try{
    if(await dbAvailable()){
      const { prisma } = (await import('@/server/db')) as any
      await prisma.agentLog.create({ data: { journeyId: log.journeyId, userId: log.userId, agent: log.agent, action: log.action, details: log.details } })
      return
    }
  }catch{
    forceMemory = true
  }
  mem.agentLogs.push({ ...log, ts: Date.now() })
  if(mem.agentLogs.length > MAX_LOGS){ mem.agentLogs.splice(0, mem.agentLogs.length - MAX_LOGS) }
}

export async function listAgentLogs(opts?: { journeyId?: string; limit?: number }): Promise<AgentLog[]>{
  const limit = Math.max(1, Math.min(opts?.limit ?? 50, 200))
  try{
    if(await dbAvailable()){
      const { prisma } = (await import('@/server/db')) as any
      const rows = await prisma.agentLog.findMany({ where: { journeyId: opts?.journeyId ?? undefined }, orderBy: { ts: 'desc' }, take: limit })
      return rows.map((r:any)=>({ ts: new Date(r.ts).getTime(), journeyId: r.journeyId ?? undefined, userId: r.userId ?? undefined, agent: r.agent, action: r.action, details: r.details ?? undefined }))
    }
  }catch{
    forceMemory = true
  }
  let arr = mem.agentLogs
  if(opts?.journeyId){ arr = arr.filter(l => l.journeyId === opts.journeyId) }
  return arr.slice(-limit)
}
