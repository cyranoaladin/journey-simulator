// Basic metrics collector for Money Factory AI
// Used to track business metrics like mints, logins, and agent runs

type MetricType = 'mint_attempt' | 'mint_success' | 'mint_failure' | 'login' | 'agent_run'

interface MetricEvent {
  type: MetricType
  value?: number
  tags?: Record<string, string>
  timestamp: number
}

class MetricsCollector {
  private metrics: MetricEvent[] = []

  track(type: MetricType, value: number = 1, tags: Record<string, string> = {}) {
    const event: MetricEvent = {
      type,
      value,
      tags,
      timestamp: Date.now(),
    }

    this.metrics.push(event)

    // In a real app, we would flush this to Datadog, Prometheus, or a DB
    console.log('[METRICS]', { type, value, tags })
  }

  getMetrics() {
    return this.metrics
  }
}

export const metrics = new MetricsCollector()
