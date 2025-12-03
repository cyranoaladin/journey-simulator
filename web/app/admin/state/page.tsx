export const dynamic = 'force-dynamic'

export default async function AdminStatePage({
  searchParams,
}: {
  searchParams?: { journeyId?: string }
}) {
  const journeyId = searchParams?.journeyId
  
  const queryParams = new URLSearchParams();
  if (journeyId) queryParams.append('journey_id', journeyId);
  queryParams.append('limit', '50'); // Equivalent to take: 50
  // orderBy: { updatedAt: 'desc' } will be approximated by ordering by id desc if no specific order_by is implemented in FastAPI

  const response = await fetch(`http://localhost:8000/journey_states/?${queryParams.toString()}`, { // TODO: Replace with actual FastAPI URL
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  const states = await response.json()
  if (!response.ok) {
    return (
      <main className="min-h-screen p-8 lg:p-12">
        <p className="text-red-500">Error fetching journey states: {states.detail || 'Unknown error'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 lg:p-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">JourneyState (last 50)</h1>
        <nav className="text-sm opacity-80 flex gap-3">
          <a className="underline hover:no-underline" href="/admin/logs">
            Logs
          </a>
          <a className="underline hover:no-underline" href="/admin/users">
            Users
          </a>
        </nav>
      </div>
      <form className="mb-4">
        <input
          name="journeyId"
          placeholder="Filter by journeyId"
          defaultValue={searchParams?.journeyId || ''}
          className="px-3 py-2 rounded bg-black/20 border border-white/10"
        />
        <button className="ml-2 px-3 py-2 rounded bg-white/10 border border-white/10">
          Filter
        </button>
      </form>
      <div className="grid gap-4">
        {states.map((s: any) => ( // Changed s type to any
          <div key={s.id} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
            <div className="text-sm opacity-80 mb-1">journeyId: {s.journey_id}</div>
            <div className="text-xs opacity-60 mb-2">updatedAt: {new Date(s.id).toISOString()}</div> {/* Assuming id is used as updated_at proxy */}
            <div className="text-xs mb-2">userId: {s.user_id ?? '—'}</div>
            <a
              className="text-xs underline"
              href={`/admin/logs?journeyId=${encodeURIComponent(s.journey_id)}`}
            >
              View logs for this journey
            </a>
            <details className="mb-2">
              <summary className="cursor-pointer text-sm">last_state</summary>
              <pre className="text-xs overflow-auto p-2 bg-black/40 rounded">
                {JSON.stringify(s.last_state, null, 2)}
              </pre>
            </details>
            {s.last_metadata && (
              <details>
                <summary className="cursor-pointer text-sm">last_metadata</summary>
                <pre className="text-xs overflow-auto p-2 bg-black/40 rounded">
                  {JSON.stringify(s.last_metadata, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
