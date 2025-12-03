export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const agentLogsResponse = await fetch('http://localhost:8000/agent_logs/?limit=200', { // TODO: Replace with actual FastAPI URL
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  const agentUsers = await agentLogsResponse.json()

  const mintLogsResponse = await fetch('http://localhost:8000/mint/mintlogs/?limit=200', { // TODO: Replace with actual FastAPI URL
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  const mintUsers = await mintLogsResponse.json()

  const map = new Map<string, { userId: string; lastSeen: number; sources: string[] }>()
  for (const row of agentUsers) {
    if (!row.user_id) continue
    const id = row.user_id
    const ts = row.ts instanceof Date ? row.ts.getTime() : new Date(row.ts).getTime()
    const cur = map.get(id)
    if (!cur || ts > cur.lastSeen) {
      map.set(id, {
        userId: id,
        lastSeen: ts,
        sources: cur?.sources ? Array.from(new Set([...cur.sources, 'agent'])) : ['agent'],
      })
    }
  }
  for (const row of mintUsers) {
    if (!row.user_id) continue
    const id = row.user_id
    const ts =
      row.created_at instanceof Date ? row.created_at.getTime() : new Date(row.created_at).getTime()
    const cur = map.get(id)
    if (!cur || ts > cur.lastSeen) {
      map.set(id, {
        userId: id,
        lastSeen: ts,
        sources: cur?.sources ? Array.from(new Set([...cur.sources, 'mint'])) : ['mint'],
      })
    }
  }
  const users = Array.from(map.values())
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 20)

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-2xl font-semibold mb-4">Recent users (last 20)</h1>
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-3 py-2">User ID</th>
              <th className="text-left px-3 py-2">Last seen</th>
              <th className="text-left px-3 py-2">Sources</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId} className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-xs">{u.userId}</td>
                <td className="px-3 py-2">{new Date(u.lastSeen).toLocaleString()}</td>
                <td className="px-3 py-2 text-xs">{u.sources.join(', ')}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="px-3 py-3 opacity-60" colSpan={3}>
                  No recent users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
