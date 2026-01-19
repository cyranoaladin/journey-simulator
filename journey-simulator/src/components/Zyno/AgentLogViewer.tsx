/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useEffect, useMemo, useState } from 'react';
import type { AgentLogEntry } from './types';
import { api } from '../../utils/api';
import { logger } from '../../utils/logger';
import LazyLoadList from '../shared/LazyLoadList';

const fetchAgentLogs = async (): Promise<AgentLogEntry[]> => {
  try {
    const logs = await api.getAgentLogs("default");
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    logger.error('[AgentLogViewer] Failed to fetch agent logs', error);
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

  const normalizedUser = useMemo(() => toLower(userIdFilter.trim()), [userIdFilter]);
  const normalizedAgent = useMemo(() => toLower(agentFilter.trim()), [agentFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesUser =
        normalizedUser.length === 0 || toLower(log.userId).includes(normalizedUser);
      const matchesAgent =
        normalizedAgent.length === 0 || toLower(log.agentName).includes(normalizedAgent);
      return matchesUser && matchesAgent;
    });
  }, [logs, normalizedUser, normalizedAgent]);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold"> Agent Interaction Logs</h2>
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

      {filteredLogs.length === 0 ? (
        <p className="text-sm text-slate-500">No logs recorded yet.</p>
      ) : (
        <LazyLoadList
          items={filteredLogs}
          itemsPerBatch={15}
          threshold={200}
          containerHeight="520px"
          className="grid gap-3"
          getKey={(log, index) => `${log.userId}-${log.agentName}-${log.timestamp}-${index}`}
          renderItem={(log, index) => {
            const payload = log.payload as unknown;
            const payloadKeyCount =
              payload && typeof payload === 'object' ? Object.keys(payload).length : 0;

            return (
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
                <details className="mt-2">
                  <summary className="cursor-pointer select-none font-semibold text-sm">
                    Payload <span className="text-xs text-slate-500">({payloadKeyCount} keys)</span>
                  </summary>
                  <pre className="mt-2 bg-slate-900 text-slate-100 text-xs rounded-md p-2 overflow-x-auto">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </details>
              </article>
            );
          }}
        />
      )}
    </section>
  );
}
