import React from 'react';

/**
 * Safely highlights:
 * - "quoted text"  -> cyan
 * - *emphasized*   -> gold
 *
 * Returns React nodes (no dangerouslySetInnerHTML) to avoid XSS.
 */
export function renderHighlightedText(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const re = /("([^"]+)")|(\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const quoted = match[2];
    const emphasized = match[4];

    if (quoted) {
      nodes.push(
        <span key={`q-${match.index}`} className="text-accent-cyan">
          “{quoted}”
        </span>,
      );
    } else if (emphasized) {
      nodes.push(
        <span key={`e-${match.index}`} className="font-semibold text-accent-gold">
          {emphasized}
        </span>,
      );
    } else {
      nodes.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
}


