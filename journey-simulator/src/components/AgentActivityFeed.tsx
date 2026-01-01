import { useCallback, useEffect, useRef, useState } from 'react';
import { useJourneyStore } from '../store/journeyStore';
import { API_BASE_URL } from '../utils/api';
import { tokenStore } from '../utils/tokenStore';

interface AgentLogItem {
  ts: number;
  journeyId?: string;
  userId?: string;
  agent: string;
  action: string;
  details?: Record<string, unknown>;
}

const buildDemoLogs = (): AgentLogItem[] => {
  const now = Date.now();
  return [
    {
      ts: now - 1000 * 45,
      agent: 'zyno-orchestrator',
      action: 'Mission state recalibrated',
      details: {
        phase: 'Topology Reconnaissance',
        aepoDelta: '+4.2',
      },
    },
    {
      ts: now - 1000 * 90,
      agent: 'guardian-agent',
      action: 'Risk dashboard synced',
      details: {
        finding: 'DePIN validator lag resolved',
      },
    },
    {
      ts: now - 1000 * 150,
      agent: 'coach-agent',
      action: 'Issued proof coaching prompt',
      details: {
        focus: 'Solana Systems Lab',
      },
    },
  ];
};

const isDemoSession = (): boolean => {
  return tokenStore.getAccessToken() === 'demo-token';
};

export default function AgentActivityFeed() {
  const ensureApiJourneyId = useJourneyStore(s => s.ensureApiJourneyId);
  const [logs, setLogs] = useState<AgentLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [demoModeActive, setDemoModeActive] = useState<boolean>(() => isDemoSession());
  const [fetchFailed, setFetchFailed] = useState(false);
  const isMountedRef = useRef(false);
  const fetchInFlightRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Helper to update state only if component is mounted
  const updateStateIfMounted = useCallback((updater: () => void) => {
    if (isMountedRef.current) {
      updater();
    }
  }, []);

  // Helper to handle demo mode
  const handleDemoMode = useCallback(() => {
    updateStateIfMounted(() => {
      setLogs(buildDemoLogs());
      setFetchFailed(false);
      setLoading(false);
    });
    fetchInFlightRef.current = false;
  }, [updateStateIfMounted]);

  // Helper to fetch logs from API
  const fetchLogsFromApi = useCallback(async (journeyId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/agents/logs?journeyId=${encodeURIComponent(journeyId)}&limit=20`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!isMountedRef.current) {
      return;
    }

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      const payload = Array.isArray(json.logs) ? (json.logs as AgentLogItem[]) : [];
      updateStateIfMounted(() => {
        setLogs(payload);
        setFetchFailed(false);
      });
    } else {
      updateStateIfMounted(() => {
        setFetchFailed(true);
      });
    }
  }, [updateStateIfMounted]);

  const fetchLogs = useCallback(async () => {
    // Guard: Prevent concurrent fetches
    if (fetchInFlightRef.current || !isMountedRef.current) {
      return;
    }

    fetchInFlightRef.current = true;

    const demoSession = isDemoSession();
    updateStateIfMounted(() => {
      setDemoModeActive(demoSession);
    });

    // Handle demo mode
    if (demoSession) {
      handleDemoMode();
      return;
    }

    // Prepare for API fetch
    updateStateIfMounted(() => {
      setLoading(true);
      setFetchFailed(false);
    });

    const journeyId = ensureApiJourneyId();

    try {
      await fetchLogsFromApi(journeyId);
    } catch (error: unknown) {
      if (!isMountedRef.current) {
        return;
      }
      // Guard: Ignore abort errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      updateStateIfMounted(() => {
        setFetchFailed(true);
      });
    } finally {
      updateStateIfMounted(() => {
        setLoading(false);
      });
      fetchInFlightRef.current = false;
    }
  }, [ensureApiJourneyId, updateStateIfMounted, handleDemoMode, fetchLogsFromApi]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (demoModeActive || fetchFailed) {
      return;
    }

    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [demoModeActive, fetchFailed, fetchLogs]);

  return (
    <div className="glass-effect rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">Agent Activity</h4>
        <button className="text-xs opacity-70 hover:opacity-100" onClick={fetchLogs} disabled={loading}>
          {loading ? '…' : 'Refresh'}
        </button>
      </div>
      {(demoModeActive || fetchFailed) && (
        <div className={`mb-2 text-xs ${demoModeActive ? 'opacity-70' : 'text-amber-400'}`}>
          {demoModeActive
            ? 'Demo mode supplies synthetic agent telemetry while backend services are offline.'
            : 'Agent telemetry endpoint is unavailable. Start the backend on port 3000 to stream live logs.'}
        </div>
      )}
      <div className="space-y-2 max-h-64 overflow-auto">
        {logs.length === 0 && !loading && !fetchFailed && (
          <div className="text-xs opacity-70">No recent activity</div>
        )}
        {logs.map((l, i) => {
          const date = new Date(l.ts);
          const time = date.toLocaleTimeString();
          // Generate stable key from log properties
          const logKey = `${l.agent}-${l.ts}-${l.action || i}-${l.journeyId || ''}-${l.userId || ''}`;
          return (
            <div key={logKey} className="text-xs border border-white/10 rounded-md p-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{l.agent}</span>
                  <span className="opacity-70"> — {l.action}</span>
                </div>
                <span className="opacity-60">{time}</span>
              </div>
              {l.details && <pre className="mt-1 text-[11px] opacity-80 whitespace-pre-wrap">{JSON.stringify(l.details)}</pre>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
