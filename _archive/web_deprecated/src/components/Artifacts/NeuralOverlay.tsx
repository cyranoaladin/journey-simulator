import React from 'react'

type NeuralOverlayProps = {
  isVisible: boolean
  agentName: string
  taskName: string
}

export function NeuralOverlay({ isVisible, agentName, taskName }: NeuralOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/80 p-6 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-2 text-xs uppercase tracking-widest text-emerald-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        Neural Swarm Active
      </div>
      <h3 className="text-2xl font-semibold text-white">{agentName} is working…</h3>
      <p className="mt-2 text-sm text-emerald-200">{`> ${taskName}`}</p>
      <p className="mt-6 max-w-sm text-xs text-white/60">
        Visual overlay placeholder — original animation lives in the simulator app. Replace with the
        production canvas when assets are ready.
      </p>
    </div>
  )
}
