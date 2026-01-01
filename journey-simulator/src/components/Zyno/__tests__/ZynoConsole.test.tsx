import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { API_BASE_URL } from '../../../utils/api';

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
  let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy?.mockRestore();
  });

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
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('enables mission launch and renders mission feedback after success', async () => {
    const { ZynoConsole } = await import('../ZynoConsole');

    render(<ZynoConsole />);

    const textarea = screen.getByLabelText('Mission Input / Intent');
    await userEvent.type(textarea, 'Build a DAO hub');

    const launchButton = screen.getByRole('button', { name: 'Start Simulation' });
    await userEvent.click(launchButton);

    await waitFor(() => {
      const orchestrationCalls = mockFetch.mock.calls.filter(([url]) =>
        typeof url === 'string' && url.includes('/orchestration')
      );
      expect(orchestrationCalls).toHaveLength(1);
    });

    const missionSummary = await screen.findByTestId('mission-summary');
    expect(missionSummary).toHaveTextContent('50');

    expect(screen.getByTestId('mission-flow')).toHaveTextContent('launch-dao');

    const orchestrationCall = mockFetch.mock.calls.find(([url]) =>
      typeof url === 'string' && url === `${API_BASE_URL}/orchestration`
    );

    expect(orchestrationCall).toBeDefined();
    expect(orchestrationCall?.[1]).toEqual(expect.objectContaining({ method: 'POST' }));
  });

  it('should display a timeout error immediately if fetch rejects with AbortError', async () => {
    // Mock global.fetch ONLY for this test to immediately reject with AbortError
    globalThis.fetch = vi.fn(() => Promise.reject(new DOMException('Aborted', 'AbortError'))) as unknown as typeof fetch;

    const { ZynoConsole } = await import('../ZynoConsole');
    render(<ZynoConsole />);

    const textarea = screen.getByLabelText('Mission Input / Intent');
    await userEvent.type(textarea, 'A prompt that will immediately time out');

    const launchButton = screen.getByRole('button', { name: 'Start Simulation' });
    await userEvent.click(launchButton);
    
    // Now, the error message should be displayed because the fetch mock immediately rejected
    await waitFor(() => {
      const errorLi = screen.getByText(/Request timed out\. Please try again\./i);
      expect(errorLi).toBeInTheDocument();
    });
    
    // And the button should be re-enabled
    expect(screen.getByRole('button', { name: 'Start Simulation' })).toBeEnabled();
  });
});
