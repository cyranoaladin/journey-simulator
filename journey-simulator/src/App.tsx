import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { WorkspaceLayoutProvider } from './hooks/useWorkspaceLayout';
import { ZynoStreamProvider } from './hooks/useZynoStream';
import { ToastProvider } from './contexts/ToastContext';
import { AppShell } from './components/layout';
import { DashboardSkeleton } from './components/ui';

// Lazy load pages
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const JourneyView   = lazy(() => import('./pages/JourneyView'));
const AgentsView    = lazy(() => import('./pages/AgentsView'));
const DAOView       = lazy(() => import('./pages/DAOView'));
const LaunchpadView = lazy(() => import('./pages/LaunchpadView'));
const ProfileView   = lazy(() => import('./pages/ProfileView'));
const SettingsView  = lazy(() => import('./pages/SettingsView'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/journey" element={<JourneyView />} />
        <Route path="/agents" element={<AgentsView />} />
        <Route path="/dao" element={<DAOView />} />
        <Route path="/launchpad" element={<LaunchpadView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <WorkspaceLayoutProvider>
      <ZynoStreamProvider>
        <ToastProvider>
          <AppShell>
            <Suspense fallback={<DashboardSkeleton />}>
              <AnimatedRoutes />
            </Suspense>
          </AppShell>
        </ToastProvider>
      </ZynoStreamProvider>
    </WorkspaceLayoutProvider>
  );
}

export default App;
