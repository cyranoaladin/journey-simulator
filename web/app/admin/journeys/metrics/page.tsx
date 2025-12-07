'use client'

import { useEffect, useState } from 'react'

// Define types locally if not sharing code
interface GlobalMetrics {
  totalJourneys: number
  completedJourneys: number
  journeysByState: Record<string, number>
  globalCompletionAvg: number
  investorDemoRuns: number
  agentRuns: {
    total: number
    avgDurationMs: number
    successRate: number
  }
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/journeys/metrics`
        )
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (err) {
        console.error('Failed to fetch metrics', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return <div className="p-8 text-white">Loading metrics...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-black min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Journey Metrics</h2>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Journeys"
            value={metrics?.totalJourneys || 0}
            icon="📊"
            sub="All time started"
          />
          <MetricCard
            title="Active Users"
            value={metrics?.agentRuns.total || 0}
            icon="🤖"
            sub="Total agent interactions"
          />
          <MetricCard
            title="Avg Completion"
            value={`${metrics?.globalCompletionAvg}%`}
            icon="🎯"
            sub="Global average progress"
          />
          <MetricCard
            title="Investor Demo Runs"
            value={metrics?.investorDemoRuns || 0}
            icon="🚀"
            sub="Unique demo sessions"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-xl border border-white/10 bg-white/5 text-white shadow-sm">
            <div className="p-6 flex flex-col space-y-1.5">
              <h3 className="font-semibold leading-none tracking-tight">Agent Performance</h3>
              <p className="text-sm text-neutral-400">Success rates and timing</p>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-8">
                <StatRow
                  label="Success Rate"
                  value={`${metrics?.agentRuns.successRate}%`}
                  sub="Across all agents"
                  highlight="green"
                />
                <StatRow
                  label="Avg Duration"
                  value={`${metrics?.agentRuns.avgDurationMs}ms`}
                  sub="Response time"
                  highlight="blue"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  sub,
}: {
  title: string
  value: string | number
  icon: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 text-white shadow-sm">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-neutral-400">{sub}</p>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string | number
  sub: string
  highlight: 'green' | 'blue'
}) {
  const colorClass = highlight === 'green' ? 'text-green-500' : 'text-blue-500'
  return (
    <div className="flex items-center">
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-sm text-neutral-400">{sub}</p>
      </div>
      <div className={`ml-auto font-medium ${colorClass}`}>{value}</div>
    </div>
  )
}
