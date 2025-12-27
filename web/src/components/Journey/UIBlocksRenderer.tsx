'use client'

export type JourneyBlock = any

type Props = { blocks: JourneyBlock[]; onAction?: (actionId: string) => void }

// ReplaceAll doesn't work with regex, use replace with global flag for HTML tag removal
const stripHtmlToText = (raw: unknown): string =>
  typeof raw === 'string' ? raw.replace(/<[^>]+>/g, '').trim() : ''

// Helper function to generate stable keys
const generateKey = (item: any, fallbackPrefix: string, fallbackFields: string[] = []): string => {
  // Priority 1: Use id or uuid if available
  if (item?.id) return String(item.id)
  if (item?.uuid) return String(item.uuid)

  // Priority 2: Use action_id for suggestions
  if (item?.action_id) return `action-${item.action_id}`

  // Priority 3: Generate composite key from fallback fields
  const compositeParts = fallbackFields
    .map((field) => {
      const value = item?.[field]
      return value ? String(value).trim() : null
    })
    .filter(Boolean)

  if (compositeParts.length > 0) {
    return `${fallbackPrefix}-${compositeParts.join('-')}`
  }

  // Priority 4: Last resort - use prefix with a hash of the item
  const itemStr = JSON.stringify(item)
  const hash = itemStr.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0
  }, 0)
  return `${fallbackPrefix}-${Math.abs(hash)}`
}

export function UIBlocksRenderer({ blocks, onAction }: Props) {
  if (!blocks?.length) return null
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b: any) => {
        // Generate stable key for block: prioritize id/uuid, fallback to kind-title composite
        const blockKey = b?.id || b?.uuid || generateKey(b, b?.kind || 'block', ['title', 'kind'])
        switch (b.kind) {
          case 'text_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <h3 className="text-lg font-semibold mb-1">{b.title}</h3>
                <pre className="whitespace-pre-wrap text-sm opacity-90">{b.body_markdown}</pre>
              </div>
            )
          case 'checklist_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <ul className="flex flex-col gap-2">
                  {(b.items || []).map((it: any) => {
                    const plainLabel = stripHtmlToText(it.label)
                    const itemKey = generateKey(it, 'checklist-item', ['label', 'id'])
                    const inputId = `${blockKey}-${itemKey}`
                    return (
                      <li key={itemKey} className="text-sm">
                        <label htmlFor={inputId} className="flex items-start gap-2 cursor-pointer">
                          <input
                            id={inputId}
                            type="checkbox"
                            defaultChecked={!!it.checked}
                            className="mt-1"
                            aria-label={plainLabel || undefined}
                          />
                          <span dangerouslySetInnerHTML={{ __html: it.label }} />
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          case 'mission_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <div className="text-xs opacity-70 mb-1">
                  mission_type: {b.mission_type} · xp: {b.xp_reward}
                </div>
                <h3 className="text-lg font-semibold mb-1">{b.title}</h3>
                <p className="text-sm opacity-90">{b.description}</p>
              </div>
            )
          case 'resource_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <div className="grid gap-2">
                  {(b.resources || []).map((r: any) => {
                    const resourceKey = generateKey(r, 'resource', [
                      'label',
                      'url',
                      'resource_type',
                    ])
                    return (
                      <div key={resourceKey} className="rounded border border-white/10 p-3">
                        <div className="text-sm font-semibold">{r.label}</div>
                        {r.description && <div className="text-xs opacity-80">{r.description}</div>}
                        {r.url && (
                          <a className="text-xs underline" href={r.url} target="_blank">
                            Ouvrir
                          </a>
                        )}
                        <div className="text-[11px] opacity-60">
                          type: {r.resource_type} · agent: {r.agent_owner}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          case 'document_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <div className="text-xs opacity-70 mb-1">{b.doc_type}</div>
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <pre className="text-xs whitespace-pre-wrap bg-black/30 p-3 rounded">
                  {b.content_markdown}
                </pre>
              </div>
            )
          case 'evaluation_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <div className="text-sm mb-2">
                  Score: {b.global_score}/{b.max_score}
                </div>
                <ul className="text-xs grid gap-1">
                  {(b.axes || []).map((ax: any) => {
                    const axisKey = generateKey(ax, 'evaluation-axis', ['name', 'id'])
                    return (
                      <li key={axisKey} className="rounded bg-black/30 p-2">
                        <div className="font-semibold">
                          {ax.name} — {ax.score}/{ax.max_score}
                        </div>
                        <div className="opacity-80">{ax.comment}</div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          case 'action_suggestions_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {(b.suggestions || []).map((s: any) => {
                    const suggestionKey = generateKey(s, 'suggestion', ['action_id', 'label'])
                    return (
                      <button
                        key={suggestionKey}
                        onClick={() => onAction?.(s.action_id)}
                        className="inline-flex items-center rounded px-2 py-1 text-xs bg-white/10 border border-white/10 hover:bg-white/20"
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          case 'xp_block':
            return (
              <div key={blockKey} className="rounded-xl border border-white/10 p-4 bg-bg-mid/40">
                <h3 className="text-lg font-semibold mb-2">{b.title || 'Progression'}</h3>
                <div className="text-sm">
                  XP actuelle: {b.current_xp} · +{b.gained_xp} (prochain palier: {b.next_level_xp})
                </div>
                {b.comment && <div className="text-xs opacity-80 mt-1">{b.comment}</div>}
              </div>
            )
          default:
            return (
              <div
                key={blockKey}
                className="rounded-xl border border-white/10 p-4 bg-bg-mid/40 text-xs opacity-70"
              >
                Bloc non pris en charge: {b.kind}
              </div>
            )
        }
      })}
    </div>
  )
}
