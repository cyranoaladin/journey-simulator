import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../utils/api'
import { useJourneyStore } from '../store/journeyStore'

interface AgentLogItem {
  ts: number
  journeyId?: string
  userId?: string
  agent: string
  action: string
  details?: Record<string, any>
}

export default function AgentActivityFeed(){
  const ensureApiJourneyId = useJourneyStore(s=>s.ensureApiJourneyId)
  const [logs, setLogs] = useState<AgentLogItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    const id = ensureApiJourneyId()
    try{
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/agents/logs?journeyId=${encodeURIComponent(id)}&limit=20`)
      if(res.ok){
        const json = await res.json()
        setLogs(Array.isArray(json.logs) ? json.logs : [])
      }
    }catch{
      /* noop */
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchLogs()
    const t = setInterval(fetchLogs, 10000)
    return ()=>clearInterval(t)
  }, [])

  return (
    <div className="glass-effect rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">Agent Activity</h4>
        <button className="text-xs opacity-70 hover:opacity-100" onClick={fetchLogs} disabled={loading}>
          {loading? '…' : 'Refresh'}
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-auto">
        {logs.length===0 && <div className="text-xs opacity-70">No recent activity</div>}
        {logs.map((l, i)=>{
          const date = new Date(l.ts)
          const time = date.toLocaleTimeString()
          return (
            <div key={i} className="text-xs border border-white/10 rounded-md p-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{l.agent}</span>
                  <span className="opacity-70"> — {l.action}</span>
                </div>
                <span className="opacity-60">{time}</span>
              </div>
              {l.details && <pre className="mt-1 text-[11px] opacity-80 whitespace-pre-wrap">{JSON.stringify(l.details)}</pre>}
            </div>
          )
        })}
      </div>
    </div>
  )
}