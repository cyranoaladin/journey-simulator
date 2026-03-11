/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

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

const FASTAPI_BASE = process.env.FASTAPI_URL ?? ''
// Fallback in-memory store
const mem = {
  journeyStates: new Map<string, JourneyStateRecord>(),
  agentLogs: [] as AgentLog[],
}
const MAX_LOGS = 200

const remoteEnabled = () => Boolean(FASTAPI_BASE)

async function dbAvailable(): Promise<boolean> {
  return remoteEnabled()
}

export async function setJourneyState(journeyId: string, nextState: any, metadata?: any) {
  try {
    if (await dbAvailable()) {
      const response = await fetch(`${FASTAPI_BASE}/journey_states/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journey_id: journeyId,
          user_id: 'unknown',
          last_state: nextState,
          last_metadata: metadata,
        }), // Assuming user_id is 'unknown' for now
      })
      if (!response.ok) {
        console.warn('Failed to upsert journey state to FastAPI', await response.json())
      }
      return
    }
  } catch (e) {
    console.warn('Error in setJourneyState with FastAPI:', e)
  }
  const rec: JourneyStateRecord = {
    journeyId,
    last_state: nextState,
    last_metadata: metadata,
    updatedAt: Date.now(),
  }
  mem.journeyStates.set(journeyId, rec)
}

export async function getJourneyState(journeyId: string): Promise<JourneyStateRecord | null> {
  try {
    if (await dbAvailable()) {
      // This will now always be false
      // Fallback to FastAPI
      const response = await fetch(`${FASTAPI_BASE}/journey_states/?journey_id=${journeyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        if (response.status === 404) return null // Not found
        console.warn('Failed to fetch journey state from FastAPI', await response.json())
        return null
      }
      const row = await response.json()
      if (!row || row.length === 0) return null
      const firstRow = row[0] // Assuming journey_id is unique
      return {
        journeyId: firstRow.journey_id,
        last_state: firstRow.last_state,
        last_metadata: firstRow.last_metadata ?? undefined,
        updatedAt: new Date(firstRow.id).getTime(), // Using id as proxy for updatedAt
      }
    }
  } catch (e) {
    console.warn('Error in getJourneyState with FastAPI:', e)
  }
  return mem.journeyStates.get(journeyId) ?? null
}

export async function pushAgentLog(log: AgentLog) {
  try {
    if (await dbAvailable()) {
      const response = await fetch(`${FASTAPI_BASE}/agent_logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ts: log.ts ? new Date(log.ts).toISOString() : new Date().toISOString(), // Convert to ISO string
          level: 'info', // Assuming default level as info
          message: log.action, // Using action as message
          user_id: log.userId,
          details: log.details,
        }),
      })
      if (!response.ok) {
        console.warn('Failed to push agent log to FastAPI', await response.json())
      }
      return
    }
  } catch (e) {
    console.warn('Error in pushAgentLog with FastAPI:', e)
  }
  mem.agentLogs.push({ ...log, ts: Date.now() })
  if (mem.agentLogs.length > MAX_LOGS) {
    mem.agentLogs.splice(0, mem.agentLogs.length - MAX_LOGS)
  }
}

export async function listAgentLogs(opts?: {
  journeyId?: string
  limit?: number
}): Promise<AgentLog[]> {
  const limit = Math.max(1, Math.min(opts?.limit ?? 50, 200))
  try {
    if (await dbAvailable()) {
      const queryParams = new URLSearchParams()
      if (opts?.journeyId) queryParams.append('journey_id', opts.journeyId) // FastAPI endpoint only filters by user_id
      queryParams.append('limit', limit.toString())

      const response = await fetch(`${FASTAPI_BASE}/agent_logs/?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        console.warn('Failed to list agent logs from FastAPI', await response.json())
        return []
      }
      const logs = await response.json()
      return logs.map((r: any) => ({
        ts: new Date(r.ts).getTime(),
        journeyId: r.journey_id ?? undefined, // FastAPI uses user_id
        userId: r.user_id ?? undefined,
        agent: r.agent, // Assuming these fields exist
        action: r.message, // Assuming action is mapped to message
        details: r.details ?? undefined,
      }))
    }
  } catch (e) {
    console.warn('Error in listAgentLogs with FastAPI:', e)
  }
  let arr = mem.agentLogs
  if (opts?.journeyId) {
    arr = arr.filter((l) => l.journeyId === opts.journeyId)
  }
  return arr.slice(-limit)
}
