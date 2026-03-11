/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import React, { useMemo } from 'react'

type ArtifactModalProps = {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  title: string
}

export function ArtifactModal({ isOpen, onClose, fileUrl, title }: ArtifactModalProps) {
  const resolvedUrl = useMemo(() => {
    if (!fileUrl) return ''
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl
    if (typeof window === 'undefined') return fileUrl

    try {
      return new URL(fileUrl, window.location.origin).href
    } catch (error) {
      console.warn('Failed to resolve artifact URL', error)
      return fileUrl
    }
  }, [fileUrl])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a1f] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-300">Artifact Viewer</p>
            <h3 className="text-lg font-semibold text-white">{title || 'Artifact'}</h3>
          </div>
          <div className="flex gap-2">
            {resolvedUrl ? (
              <a
                className="rounded border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                href={resolvedUrl}
                download
              >
                Download
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </header>
        <div className="flex-1 bg-black">
          {resolvedUrl ? (
            <iframe src={resolvedUrl} title={title} className="h-full w-full border-0" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/60">
              No preview available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
