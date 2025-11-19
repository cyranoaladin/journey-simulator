export const dynamic = 'force-dynamic'
import { prisma } from '@/server/db'

type Props = { searchParams?: { journeyId?: string; userId?: string } }

export default async function AdminLogsPage({ searchParams }: Props){
  const journeyId = searchParams?.journeyId
  const userId = searchParams?.userId
  const where: any = {}
  if (journeyId) where.journeyId = journeyId
  if (userId) where.userId = userId
  const logs = await prisma.agentLog.findMany({ where, orderBy: { ts: 'desc' }, take: 50 })

  // extract token stats for mini chart based on server-filtered logs
  const tokenTriples = logs.map(l => {
    const t = (l as any)?.details?.perf?.tokens
    return t ? { input: Number(t.input||0), output: Number(t.output||0), total: Number(t.total||0) } : null
  }).filter(Boolean) as { input: number; output: number; total: number }[]
  const maxTotal = tokenTriples.length ? Math.max(...tokenTriples.map(t=>t.total)) : 0

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold">Agent Logs (last 50){journeyId ? ` for ${journeyId}` : ''}</h1>
        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2" action="/admin/logs" method="get">
            {journeyId && <input type="hidden" name="journeyId" value={journeyId} />}
            <input name="userId" placeholder="Filter by userId" defaultValue={userId || ''} className="px-2 py-1 rounded bg-black/20 border border-white/10 text-sm" />
            <button className="px-2 py-1 rounded bg-white/10 border border-white/10 text-sm">Filter</button>
          </form>
          <nav className="text-sm opacity-80 flex gap-3">
            <a className="underline hover:no-underline" href="/admin/state">State</a>
            <a className="underline hover:no-underline" href="/admin/users">Users</a>
          </nav>
        </div>
      </div>
      <div className="grid gap-3">
        {logs.map((l, idx) => {
          const tokens = (l as any)?.details?.perf?.tokens
          const t = tokens ? { input: Number(tokens.input||0), output: Number(tokens.output||0), total: Number(tokens.total||0) } : null
          const pct = maxTotal > 0 && t ? Math.min(100, Math.round((t.total/maxTotal)*100)) : 0
          return (
            <div key={l.id} className="rounded-lg border border-white/10 p-3 bg-bg-mid/40">
              <div className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{l.agent} — {l.action} <span className="opacity-60">@ {new Date(l.ts).toLocaleString()}</span></span>
                  {(l as any)?.details?.level === 'error' && (
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-red-600/20 text-red-300 border border-red-500/30">error</span>
                  )}
                </div>
                {t && (
                  <div className="flex items-center gap-2 text-[11px] opacity-80">
                    <span>tokens:</span>
                    <div className="w-40 h-2 bg-white/10 rounded overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono">{t.total}</span>
                  </div>
                )}
              </div>
              {t && (
                <div className="mt-2 text-[11px] opacity-70">
                  in:<span className="font-mono ml-1 mr-2">{t.input}</span>
                  out:<span className="font-mono ml-1">{t.output}</span>
                </div>
              )}
              {l.userId && (
                <div className="mt-1 text-[11px] opacity-70">
                  userId: <span className="font-mono">{l.userId}</span>
                  {' '}
                  <a className="underline hover:no-underline" href={`/admin/logs?userId=${encodeURIComponent(l.userId || '')}`}>filter by user</a>
                </div>
              )}
              {l.details && <pre className="text-xs mt-2 p-2 bg-black/40 rounded">{JSON.stringify(l.details, null, 2)}</pre>}
            </div>
          )
        })}
      </div>
    </main>
  )
}
