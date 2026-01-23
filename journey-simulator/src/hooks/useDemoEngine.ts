/**
 * useDemoEngine - Encapsulates the demo mode timing logic
 * 
 * This hook manages the demo sequencer's heartbeat (tick loop).
 * It ensures proper cleanup on unmount and prevents zombie timers.
 * 
 * The loop only runs when:
 * - demoState.isActive === true
 * - demoState.status === 'PLAYING'
 * 
 * Dependencies on demoSessionId ensure that if a new session starts,
 * the old timer is automatically cleaned up.
 */

import { useEffect, useRef } from 'react';
import { useJourneyStore } from '../store/journeyStore';

export const useDemoEngine = () => {
  const demoState = useJourneyStore((s) => s.demoState);
  const tickDemo = useJourneyStore((s) => s.tickDemo);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    clearTimer();

    if (demoState.isActive && demoState.status === 'PLAYING') {
      timerRef.current = setTimeout(() => {
        tickDemo();
      }, demoState.typingDelayMs || 1500);
    }

    return clearTimer;
  }, [
    demoState.status,
    demoState.stepIndex,
    demoState.demoSessionId,
    demoState.isActive,
    demoState.typingDelayMs,
    tickDemo
  ]);

  return {
    isActive: demoState.isActive,
    status: demoState.status,
    currentPhaseId: demoState.currentPhaseId,
    stepIndex: demoState.stepIndex,
    totalSteps: demoState.currentSequence.length,
    demoSessionId: demoState.demoSessionId,
  };
};

export default useDemoEngine;
