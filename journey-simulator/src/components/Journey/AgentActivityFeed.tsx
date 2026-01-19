/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { generateStableKey } from '../../utils/generateStableKey';


interface AgentLog {
  agent: string;
  phase: string;
  intent: string;
  reasoning: string | null;
  action: string | null;
  sources: any[];
  timestamp: string;
}

interface AgentActivityFeedProps {
  readonly step: any; // The full step response from backend
}

const AgentActivityFeed = ({ step }: AgentActivityFeedProps) => {
  // Extract relevant information from step data
  const agentLogs: AgentLog[] = step.agent_actions?.map((action: any) => ({
    agent: action.agent_name || 'Unknown Agent',
    phase: step.metadata?.phase_id || 'N/A',
    intent: step.metadata?.title || 'Step Action',
    reasoning: action.reason || null,
    action: action.action || null,
    sources: action.sources || [],
    timestamp: new Date().toISOString()
  })) || [];

  // Manually add an entry for the current step
  const currentStepLog: AgentLog = {
    agent: 'Zyno (Orchestrateur)',
    phase: step.metadata?.phase_id || 'N/A',
    intent: step.metadata?.title || 'Generated Step',
    reasoning: 'Analyzing journey state and generating user experience',
    action: 'Generating UI blocks',
    sources: [],
    timestamp: new Date().toISOString()
  };

  const allLogs = [currentStepLog, ...agentLogs];

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {allLogs.map((log, index) => {
        const logKey = generateStableKey(log, 'agent-log', ['agent', 'timestamp', 'intent']);
        return (
          <motion.div
            key={logKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-white/5 rounded-lg border border-white/10"
            data-testid={`agent-activity-item-${index}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                <span className="font-medium text-sm">{log.agent}</span>
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(log.timestamp), 'HH:mm')}
              </span>
            </div>

            <div className="mt-2 text-xs">
              <div className="text-cyan-400 font-medium">{log.intent}</div>
              {log.reasoning && (
                <div className="mt-1 text-gray-300 italic">"{log.reasoning}"</div>
              )}
              {log.action && (
                <div className="mt-1">
                  <span className="text-gray-500">Action:</span>{' '}
                  <span className="text-purple-300">{log.action}</span>
                </div>
              )}
            </div>

            {log.sources && log.sources.length > 0 && (
              <div className="mt-2 text-xs">
                <div className="text-gray-500">Sources:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {log.sources.slice(0, 3).map((source: any) => {
                    const sourceKey = generateStableKey(
                      typeof source === 'string' ? { text: source } : source,
                      'source',
                      ['text', 'url', 'title']
                    );
                    return (
                      <span
                        key={sourceKey}
                        className="px-2 py-0.5 bg-purple-900/30 rounded text-purple-300 border border-purple-900/50"
                      >
                        {typeof source === 'string' ? source.substring(0, 20) + '...' : 'Source'}
                      </span>
                    );
                  })}
                  {log.sources.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-700/50 rounded text-gray-400">
                      +{log.sources.length - 3} others
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}

      {allLogs.length === 0 && (
        <div className="text-gray-500 text-sm py-4 text-center">
          No agent activity recorded
        </div>
      )}
    </div>
  );
};

AgentActivityFeed.displayName = 'AgentActivityFeed';

export default AgentActivityFeed;
