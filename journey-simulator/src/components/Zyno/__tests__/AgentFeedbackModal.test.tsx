import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useJourneyStore } from '../../../store/journeyStore';
import type { AgentTimelineEntry } from '../types';
import { act } from 'react';

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
  let originalCloseModal: () => void;

  beforeEach(() => {
    originalCloseModal = useJourneyStore.getState().closeModal;
  });

  afterEach(() => {
    vi.clearAllMocks();
    useJourneyStore.setState({ closeModal: originalCloseModal });
  });

  it('auto closes the modal shortly after a successful submission', async () => {
    const closeModalSpy = vi.fn();
    useJourneyStore.setState({ closeModal: closeModalSpy });

    const timeoutSpy = vi.spyOn(window, 'setTimeout');

    const formModule = await import('../AgentFeedbackForm');
    expect(typeof formModule.default).toBe('function');

    const { default: AgentFeedbackModal } = await import('../AgentFeedbackModal');

    render(<AgentFeedbackModal step={baseStep} userId="demo-user" missionId="demo-mission" />);

    const trigger = screen.getByTestId('mock-feedback-form');
    expect(trigger).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(trigger);
    });

    expect(timeoutSpy).toHaveBeenCalled();
    const scheduledCall = (timeoutSpy.mock.calls as unknown as [() => void, number][]).find(
      ([, delay]) => delay === 1500
    );
    expect(scheduledCall).toBeDefined();
    const [scheduledCallback] = scheduledCall!;
    expect(closeModalSpy).not.toHaveBeenCalled();

    await act(async () => {
      scheduledCallback();
    });

    expect(closeModalSpy).toHaveBeenCalledTimes(1);

    timeoutSpy.mockRestore();
  });
});
