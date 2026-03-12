import { createContext, useContext, useState, ReactNode } from 'react';

interface WorkspaceLayoutContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  zynoOpen: boolean;
  setZynoOpen: (v: boolean) => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
}

const WorkspaceLayoutContext = createContext<WorkspaceLayoutContextValue | undefined>(undefined);

export function WorkspaceLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zynoOpen, setZynoOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <WorkspaceLayoutContext.Provider value={{
      sidebarOpen, setSidebarOpen,
      zynoOpen, setZynoOpen,
      focusMode, setFocusMode,
    }}>
      {children}
    </WorkspaceLayoutContext.Provider>
  );
}

export function useWorkspaceLayout() {
  const ctx = useContext(WorkspaceLayoutContext);
  if (!ctx) throw new Error('useWorkspaceLayout must be used within WorkspaceLayoutProvider');
  return ctx;
}
