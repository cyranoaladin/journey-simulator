import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('../AgentLogViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="agent-log-viewer" />,
}));

vi.mock('../ZynoMissionFlow', () => ({
  __esModule: true,
  default: ({ intent }: { intent: string }) => <div data-testid="mission-flow">{intent}</div>,
}));

vi.mock('../MissionFeedbackSummary', () => ({
  __esModule: true,
  default: ({ summary }: { summary: { aepoScore: number } | null }) => (
    <div data-testid="mission-summary">{summary ? summary.aepoScore : 'no-summary'}</div>
  ),
}));

vi.mock('../ZynoAgentScoreboard', () => ({
  __esModule: true,
  default: () => <div data-testid="agent-scoreboard" />,
}));

vi.mock('../ZynoDAOAdminPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="dao-admin" />,
}));

vi.mock('../AgentFeedbackForm.tsx', () => ({
  __esModule: true,
  default: ({ agentName }: { agentName: string }) => <div data-testid={`feedback-${agentName}`} />,
}));

vi.mock('../../data/sample_mission_feedback.json', () => ({
  __esModule: true,
  default: {
    userId: 'seed_user',
    timestamp: '2025-01-01T00:00:00.000Z',
    aepoScore: 50,
    aecoPhase: 'init',
    agents: [],
    generatedText: 'Initial summary',
  },
}));

const AgentScoreboardContext = React.createContext({
  apiKey: '',
  setApiKey: vi.fn(),
  state: { loading: false, error: null, lastUpdated: null, data: [] },
  fetchScoreboard: vi.fn(),
});

vi.mock('../AgentScoreboardContext', () => ({
  __esModule: true,
  AgentScoreboardProvider: ({ children }: { children: React.ReactNode }) => (
    <AgentScoreboardContext.Provider
      value={{ apiKey: '', setApiKey: vi.fn(), state: { loading: false, error: null, lastUpdated: null, data: [] }, fetchScoreboard: vi.fn() }}
    >
      {children}
    </AgentScoreboardContext.Provider>
  ),
  useAgentScoreboardContext: () => React.useContext(AgentScoreboardContext),
}));

vi.mock('../ResourceUploader', () => ({
  __esModule: true,
  default: () => <div data-testid="resource-uploader" />,
}));

describe('ZynoConsole', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        intent: 'launch-dao',
        mode: 'demo',
        executedAgents: ['BuilderAgent'],
        results: {
          BuilderAgent: {
            agent: 'BuilderAgent',
            activationLevel: 0.72,
            ae_summary: 'Plan établi',
          },
        },
        parcoursTemplate: { templateId: 'template-1' },
      }),
    } as Response);
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('enables mission launch and renders mission feedback after success', async () => {
    const { default: ZynoConsole } = await import('../ZynoConsole');

    render(<ZynoConsole />);

    const textarea = screen.getByLabelText('Entrée mission / intention');
    await userEvent.type(textarea, 'Construire un hub DAO');

    const launchButton = screen.getByRole('button', { name: 'Lancer la simulation' });
    await userEvent.click(launchButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const missionSummary = await screen.findByTestId('mission-summary');
    expect(missionSummary).toHaveTextContent('72');

    expect(screen.getByTestId('mission-flow')).toHaveTextContent('launch-dao');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/orchestration',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});
