export const dynamic = 'force-dynamic'

type Props = { searchParams?: { journeyId?: string; userId?: string } }

type TokenSummary = { input: number; output: number; total: number }

const toPositiveNumber = (value: unknown): number => {
  const coerced = Number(value)
  return Number.isFinite(coerced) ? coerced : 0
}

const extractTokenSummary = (details: any | null): TokenSummary | null => { // Changed Prisma.JsonValue to any
  if (!details || typeof details !== 'object' || Array.isArray(details)) return null
  const perf = (details as Record<string, unknown>).perf
  if (!perf || typeof perf !== 'object' || Array.isArray(perf)) return null
  const tokens = (perf as Record<string, unknown>).tokens
  if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) return null
  const tokenRecord = tokens as Record<string, unknown>
  return {
    input: toPositiveNumber(tokenRecord.input),
    output: toPositiveNumber(tokenRecord.output),
    total: toPositiveNumber(tokenRecord.total),
  }
}

const isErrorLevel = (details: any | null): boolean => { // Changed Prisma.JsonValue to any
  if (!details || typeof details !== 'object' || Array.isArray(details)) return false
  const level = (details as Record<string, unknown>).level
  return typeof level === 'string' && level.toLowerCase() === 'error'
}

export default async function AdminLogsPage({ searchParams }: Props) {
  const journeyId = searchParams?.journeyId
  const userId = searchParams?.userId
  
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('user_id', userId);
  queryParams.append('limit', '50'); // Equivalent to take: 50
  // orderBy: { ts: 'desc' } is handled by default in FastAPI endpoint

  const response = await fetch(`http://localhost:8000/agent_logs/?${queryParams.toString()}`, { // TODO: Replace with actual FastAPI URL
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  const logs = await response.json()
  if (!response.ok) {
    return NextResponse.json({ error: logs.detail || 'Failed to fetch agent logs' }, { status: response.status })
  }

  const tokenTriples = logs
    .map((log: any) => extractTokenSummary(log.details))
    .filter((summary: any): summary is TokenSummary => summary !== null)
  const maxTotal = tokenTriples.length ? Math.max(...tokenTriples.map((t: any) => t.total)) : 0
  const safeMaxTotal = maxTotal > 0 ? maxTotal : 1

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold">
          Agent Logs (last 50){journeyId ? ` for ${journeyId}` : ''}
        </h1>
        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2" action="/admin/logs" method="get">
            <label htmlFor="userId" className="sr-only">
              Filter by user identifier
            </label>
            {journeyId && <input type="hidden" name="journeyId" value={journeyId} />}
            <input
              id="userId"
              name="userId"
              placeholder="Filter by userId"
              defaultValue={userId || ''}
              className="px-2 py-1 rounded bg-black/20 border border-white/10 text-sm"
            />
            <button className="px-2 py-1 rounded bg-white/10 border border-white/10 text-sm">
              Filter
            </button>
          </form>
          <nav className="text-sm opacity-80 flex gap-3">
            <a className="underline hover:no-underline" href="/admin/state">
              State
            </a>
            <a className="underline hover:no-underline" href="/admin/users">
              Users
            </a>
          </nav>
        </div>
      </div>
      <div className="grid gap-3">
        {logs.map((log: any) => { // Changed log type to any
          const tokenStats = extractTokenSummary(log.details)
          return (
            <div key={log.id} className="rounded-lg border border-white/10 p-3 bg-bg-mid/40">
              <div className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>
                    {log.agent} — {log.action}{' '}
                    <span className="opacity-60">@ {new Date(log.ts).toLocaleString()}</span>
                  </span>
                  {isErrorLevel(log.details) && (
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-red-600/20 text-red-300 border border-red-500/30">
                      error
                    </span>
                  )}
                </div>
                {tokenStats && (
                  <div className="flex items-center gap-2 text-[11px] opacity-80">
                    <span>tokens:</span>
                    <progress
                      className="w-40 h-2 overflow-hidden rounded bg-white/10 [appearance:none] [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-purple-500 [&::-webkit-progress-value]:to-cyan-400 [&::-moz-progress-bar]:bg-purple-500"
                      value={tokenStats.total}
                      max={safeMaxTotal}
                      aria-label="Relative token usage"
                    />
                    <span className="font-mono">{tokenStats.total}</span>
                  </div>
                )}
              </div>
              {tokenStats && (
                <div className="mt-2 text-[11px] opacity-70">
                  in:<span className="font-mono ml-1 mr-2">{tokenStats.input}</span>
                  out:<span className="font-mono ml-1">{tokenStats.output}</span>
                </div>
              )}
              {log.user_id && ( // Changed userId to user_id
                <div className="mt-1 text-[11px] opacity-70">
                  userId: <span className="font-mono">{log.user_id}</span>{' '}
                  <a
                    className="underline hover:no-underline"
                    href={`/admin/logs?userId=${encodeURIComponent(log.user_id || '')}`}
                  >
                    filter by user
                  </a>
                </div>
              )}
              {log.details && (
                <pre className="text-xs mt-2 p-2 bg-black/40 rounded">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
