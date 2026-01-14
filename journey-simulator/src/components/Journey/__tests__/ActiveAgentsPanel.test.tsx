import { render, screen } from '@testing-library/react';
import { ActiveAgentsPanel } from '../ActiveAgentsPanel';
import { describe, it, expect } from 'vitest';

const baseAgents = [
  { id: 'a1', name: 'Security', role: 'Sec', status: 'waiting' as const, bio: 'sec' },
  { id: 'a2', name: 'Tokenomics', role: 'Econ', status: 'analyzing' as const, bio: 'econ' },
  { id: 'a3', name: 'Architect', role: 'Arch', status: 'done' as const, bio: 'arch' },
];

describe('ActiveAgentsPanel', () => {
  it('renders agents in waiting state', () => {
    render(<ActiveAgentsPanel agents={baseAgents} />);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('shows pulse class when analyzing', () => {
    render(<ActiveAgentsPanel agents={baseAgents} />);
    const indicator = screen.getByLabelText('analyzing-indicator');
    expect(indicator.className).toContain('animate-pulse');
  });

  it('shows done indicator when done', () => {
    render(<ActiveAgentsPanel agents={baseAgents} />);
    const done = screen.getByLabelText('done-indicator');
    expect(done.className).toContain('bg-emerald-400');
  });
});
