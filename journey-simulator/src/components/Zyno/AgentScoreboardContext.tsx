/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AgentScoreboardEntry } from '../../utils/api'
import { api } from '../../utils/api'

export const ADMIN_API_STORAGE_KEY = 'zyno-admin-api-key'

export interface AgentScoreboardState {
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  data: AgentScoreboardEntry[]
}

interface AgentScoreboardContextValue {
  state: AgentScoreboardState
  apiKey: string
  setApiKey: (value: string) => void
  fetchScoreboard: (forcedKey?: string) => Promise<void>
}

const AgentScoreboardContext = createContext<AgentScoreboardContextValue | null>(null)

const initialState: AgentScoreboardState = {
  loading: false,
  error: null,
  lastUpdated: null,
  data: []
}

const readStoredKey = () => {
  if (typeof globalThis === 'undefined') {
    return ''
  }
  return globalThis.localStorage?.getItem(ADMIN_API_STORAGE_KEY) ?? ''
}

type AgentScoreboardProviderProps = {
  children: ReactNode
}

export function AgentScoreboardProvider({ children }: AgentScoreboardProviderProps) {
  const [apiKey, setApiKey] = useState<string>(() => readStoredKey())
  const [state, setState] = useState<AgentScoreboardState>(initialState)

  const storeKey = useCallback((value: string) => {
    setApiKey(value)
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      if (value) {
        globalThis.localStorage.setItem(ADMIN_API_STORAGE_KEY, value)
      } else {
        globalThis.localStorage.removeItem(ADMIN_API_STORAGE_KEY)
      }
    }
  }, [])

  const fetchScoreboard = useCallback(async (forcedKey?: string) => {
    const keyToUse = forcedKey ?? apiKey
    if (!keyToUse) {
      setState((prev) => ({ ...prev, error: 'Admin API key required.', data: [] }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await api.getAgentScoreboard()
      setState({
        loading: false,
        error: null,
        lastUpdated: new Date(),
        data: response.users || []
      })
      if (keyToUse !== apiKey) {
        storeKey(keyToUse)
      }
    } catch (error) {
      console.error('Failed to load agent scoreboard:', error)
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load',
        lastUpdated: null,
        data: []
      })
    }
  }, [apiKey, storeKey])

  useEffect(() => {
    if (apiKey) {
      fetchScoreboard(apiKey)
    }
  }, [apiKey, fetchScoreboard])

  const value = useMemo<AgentScoreboardContextValue>(() => ({
    state,
    apiKey,
    setApiKey: storeKey,
    fetchScoreboard
  }), [apiKey, state, storeKey, fetchScoreboard])

  return (
    <AgentScoreboardContext.Provider value={value}>{children}</AgentScoreboardContext.Provider>
  )
}

export function useAgentScoreboardContext() {
  const context = useContext(AgentScoreboardContext)
  if (!context) {
    throw new Error('useAgentScoreboardContext must be used within an AgentScoreboardProvider')
  }
  return context
}
