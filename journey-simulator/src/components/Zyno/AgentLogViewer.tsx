import { useEffect, useMemo, useState } from 'react';
import type { AgentLogEntry } from './types';
import { API_BASE_URL } from '../../utils/api';

const fetchAgentLogs = async (): Promise<AgentLogEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/agent-logs`);
    if (!response.ok) {
      throw new Error(`Unable to fetch agent logs: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const toLower = (value: string) => value.toLowerCase();

export default function AgentLogViewer() {
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');

  useEffect(() => {
    fetchAgentLogs().then(setLogs);
  }, []);

  const filteredLogs = useMemo(() => {
    const normalizedUser = toLower(userIdFilter.trim());
    const normalizedAgent = toLower(agentFilter.trim());

    return logs.filter((log) => {
      const matchesUser =
        normalizedUser.length === 0 || toLower(log.userId).includes(normalizedUser);
      const matchesAgent =
        normalizedAgent.length === 0 || toLower(log.agentName).includes(normalizedAgent);
      return matchesUser && matchesAgent;
    });
  }, [logs, userIdFilter, agentFilter]);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">📊 Agent Interaction Logs</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            placeholder="User ID"
            value={userIdFilter}
            onChange={(event) => setUserIdFilter(event.target.value)}
          />
          <input
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            placeholder="Agent Name"
            value={agentFilter}
            onChange={(event) => setAgentFilter(event.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-3">
        {filteredLogs.length === 0 ? (
          <p className="text-sm text-slate-500">No logs recorded yet.</p>
        ) : (
          filteredLogs.map((log, index) => (
            <article
              key={`${log.userId}-${log.agentName}-${log.timestamp}-${index}`}
              className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <strong className="text-sm font-medium">{log.agentName}</strong>
                <span className="text-xs text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500">User: {log.userId}</p>
              {log.ae_summary && (
                <p className="text-sm">
                  <span className="font-semibold">Summary:</span> {log.ae_summary}
                </p>
              )}
              <div className="mt-2">
                <p className="font-semibold text-sm">Payload</p>
                <pre className="bg-slate-900 text-slate-100 text-xs rounded-md p-2 overflow-x-auto">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
