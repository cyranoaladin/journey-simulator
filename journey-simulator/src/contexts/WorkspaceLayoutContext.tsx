import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type Density = 'comfortable' | 'compact';

type WorkspaceLayoutContextValue = {
  focusMode: boolean;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  density: Density;
  toggleFocusMode: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  cycleDensity: () => void;
};

const WorkspaceLayoutContext = createContext<WorkspaceLayoutContextValue | undefined>(undefined);

export const WorkspaceLayoutProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [focusMode, setFocusMode] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [density, setDensity] = useState<Density>('comfortable');
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    const path = location.pathname;
    const pathChanged = lastPathRef.current !== path;
    lastPathRef.current = path;

    if (!pathChanged) {
      return;
    }

    const isDesktop = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1280px)').matches : true;

    if (path.startsWith('/journeys')) {
      setFocusMode(false);
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
      setDensity('comfortable');
    } else {
      setFocusMode(false);
      setLeftPanelOpen(isDesktop);
      setRightPanelOpen(false);
    }
  }, [location.pathname]);

  const toggleFocusMode = () => {
    setFocusMode((prev) => {
      const next = !prev;
      if (next) {
        setLeftPanelOpen(false);
        setRightPanelOpen(false);
      }
      return next;
    });
  };

  const cycleDensity = () => {
    setDensity((prev) => (prev === 'comfortable' ? 'compact' : 'comfortable'));
  };

  const value = useMemo(
    () => ({
      focusMode,
      leftPanelOpen,
      rightPanelOpen,
      density,
      toggleFocusMode,
      setLeftPanelOpen,
      setRightPanelOpen,
      cycleDensity,
    }),
    [focusMode, leftPanelOpen, rightPanelOpen, density]
  );

  return <WorkspaceLayoutContext.Provider value={value}>{children}</WorkspaceLayoutContext.Provider>;
};

export const useWorkspaceLayout = () => {
  const ctx = useContext(WorkspaceLayoutContext);
  if (!ctx) {
    throw new Error('useWorkspaceLayout must be used within a WorkspaceLayoutProvider');
  }
  return ctx;
};
