import { render, screen } from '@testing-library/react';
import { ResourceDeliveryPanel } from '../ResourceDeliveryPanel';
import { describe, it, expect } from 'vitest';

describe('ResourceDeliveryPanel', () => {
  it('renders empty state without crash', () => {
    render(<ResourceDeliveryPanel resources={[]} />);
    expect(screen.getByText(/Aucune ressource/)).toBeInTheDocument();
  });

  it('renders link for kind link', () => {
    render(
      <ResourceDeliveryPanel
        resources={[{ kind: 'link', title: 'Doc', url: 'https://example.com', description: 'desc' }]}
      />
    );
    expect(screen.getByText('Doc')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ouvrir/i })).toHaveAttribute('href', 'https://example.com');
  });

  it('renders code block for kind code', () => {
    render(
      <ResourceDeliveryPanel
        resources={[{ kind: 'code', title: 'Snippet', code: 'fn main() {}', language: 'rust' }]}
      />
    );
    expect(screen.getByText('Snippet')).toBeInTheDocument();
    expect(screen.getByText(/fn main/)).toBeInTheDocument();
  });
});
