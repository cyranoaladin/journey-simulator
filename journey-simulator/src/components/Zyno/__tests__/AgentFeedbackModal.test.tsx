import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AgentTimelineEntry } from '../types';

const closeModalSpy = vi.hoisted(() => vi.fn());

vi.mock('../../../store/journeyStore', () => ({
  useJourneyStore: () => ({
    closeModal: closeModalSpy,
  }),
}));

vi.mock('../AgentFeedbackForm', () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess?: () => void }) => (
    <button data-testid="mock-feedback-form" onClick={() => onSuccess?.()}>
      Soumettre un retour
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  __esModule: true,
  Clock: () => <span data-testid="icon-clock" />,
  MessageSquare: () => <span data-testid="icon-message" />,
  X: () => <span data-testid="icon-close" />,
}));

const baseStep: AgentTimelineEntry = {
  agent: 'BuilderAgent',
  phase: 'build-prototype',
  intent: 'product_build',
  status: 'completed',
  startedAt: '2025-11-16T10:00:00.000Z',
  completedAt: '2025-11-16T10:00:02.000Z',
  durationMs: 2000,
  prompt: 'Construire un MVP pour la demo mission',
  reasoning: 'Prioriser les modules critiques du MVP et planifier les sprints.',
  action: 'Validate roadmap and assign main owners.',
  summary: 'Plan de construction structure',
  sources: [
    {
      title: 'playbook build',
      snippet: 'Organiser le backlog par bloc fonctionnel.'
    }
  ],
  feedback: {
    ae_summary: 'Plan valide',
    ae_outcome: 'Roadmap confirmee'
  }
};

describe('AgentFeedbackModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('auto closes the modal shortly after a successful submission', async () => {
    const user = userEvent.setup();
    closeModalSpy.mockClear();
    const timeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockImplementation(((callback: TimerHandler, _delay?: number, ...args: any[]) => {
        if (typeof callback === 'function') {
          callback(...args);
        }

        return 1 as unknown as number;
      }) as typeof globalThis.setTimeout);

    const formModule = await import('../AgentFeedbackForm');
    expect(typeof formModule.default).toBe('function');

    const { default: AgentFeedbackModal } = await import('../AgentFeedbackModal');

    render(<AgentFeedbackModal step={baseStep} userId="demo-user" missionId="demo-mission" />);

    const trigger = screen.getByTestId('mock-feedback-form');
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);

    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1500);
    expect(closeModalSpy).toHaveBeenCalledTimes(1);

    timeoutSpy.mockRestore();
  });
});
