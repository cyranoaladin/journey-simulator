import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { WalletContextProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { initParticles } from './utils/particles';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Journey from './pages/Journey';
import Playground from './pages/Playground';
import Dao from './pages/Dao';
import Resources from './pages/Resources';
import Support from './pages/Support';
import Zyno from './pages/Zyno';
import JourneyCompleted from './pages/JourneyCompleted';
import HomePage from './pages/HomePage';

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

const DebugMint = lazy(() => import('./pages/DebugMint'));



function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    const cleanup = initParticles();
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <WalletContextProvider>
      <AuthProvider>
        <TutorialProvider>

          <div
            className={`min-h-screen transition-colors duration-300 ${isDark
              // ... existing code ...
              ? 'bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white'
              : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900'
              }`}
          >
            <div
              id="particles-js"
              className="pointer-events-none fixed inset-0 -z-10"
              aria-hidden="true"
            />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedLayout />}>
                <Route path="debug/mint" element={<Suspense fallback={<div>Loading…</div>}><DebugMint /></Suspense>} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="journeys" element={<Journey />} />
                <Route path="journeys/:journeyId" element={<Journey />} />
                <Route path="journeys/completed" element={<JourneyCompleted />} />
                <Route path="playground" element={<Playground />} />
                <Route path="dao" element={<Dao />} />
                <Route path="resources" element={<Resources />} />
                <Route path="support" element={<Support />} />
                <Route path="zyno" element={<Zyno />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </TutorialProvider>
      </AuthProvider>
    </WalletContextProvider>
  );
}

export default App;
