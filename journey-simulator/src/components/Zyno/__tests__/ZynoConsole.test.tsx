/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { useJourneyStore } from '../../../store/journeyStore';

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

// Mock zynoApi to intercept orchestration calls
const mockOrchestrate = vi.fn();
vi.mock('../../../api/zyno', () => ({
  __esModule: true,
  zynoApi: {
    interact: vi.fn(),
    orchestrate: mockOrchestrate,
  },
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
            ae_summary: 'Plan tabli',
          },
        },
        parcoursTemplate: { templateId: 'template-1' },
      }),
    } as Response);
    globalThis.fetch = mockFetch as unknown as typeof fetch;
    
    // Setup mockOrchestrate to return a valid ZynoInteractResponse
    mockOrchestrate.mockResolvedValue({
      success: true,
      response: 'Mission orchestrated successfully',
      sessionId: 'test-session-123',
      agentType: 'ZYNO_ORCHESTRATOR',
      latencyMs: 150,
      payload: {
        status: 'SUCCESS',
        reasoning: 'Analysis complete',
        summary: 'Mission summary',
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    useJourneyStore.setState({ runMode: 'simulation' });
  });

  it('enables mission launch and renders mission feedback after success', async () => {
    const { ZynoConsole } = await import('../ZynoConsole');

    render(<ZynoConsole />);

    const textarea = screen.getByLabelText('Mission Input / Intent');
    await userEvent.type(textarea, 'Build a DAO hub');

    const launchButton = screen.getByRole('button', { name: 'Start Simulation' });
    await userEvent.click(launchButton);

    await waitFor(() => {
      expect(mockOrchestrate).toHaveBeenCalledTimes(1);
    });

    const missionSummary = await screen.findByTestId('mission-summary');
    expect(missionSummary).toHaveTextContent('85');

    expect(screen.getByTestId('mission-flow')).toHaveTextContent('Build a DAO hub');

    expect(mockOrchestrate).toHaveBeenCalledWith('Build a DAO hub');
  });

  it('extends the orchestration timeout when run mode is real', async () => {
    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    useJourneyStore.setState({ runMode: 'real' });

    const { ZynoConsole } = await import('../ZynoConsole');

    render(<ZynoConsole />);

    const textarea = screen.getByLabelText('Mission Input / Intent');
    await userEvent.type(textarea, 'Investigate treasury strategy');

    const launchButton = screen.getByRole('button', { name: 'Start Simulation' });
    await userEvent.click(launchButton);

    await waitFor(() => {
      expect(mockOrchestrate).toHaveBeenCalledTimes(1);
    });

    expect(timeoutSpy.mock.calls.some(([, delay]) => delay === 180000)).toBe(true);

    timeoutSpy.mockRestore();
  });

  it('should display a timeout error immediately if zynoApi rejects with AbortError', async () => {
    // Mock zynoApi.orchestrate to immediately reject with AbortError
    mockOrchestrate.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

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
