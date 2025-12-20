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
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Journey = lazy(() => import('./pages/Journey'));
const JourneyDemo = lazy(() => import('./pages/JourneyDemo'));
const Playground = lazy(() => import('./pages/Playground'));
const Dao = lazy(() => import('./pages/Dao'));
const Resources = lazy(() => import('./pages/Resources'));
const Support = lazy(() => import('./pages/Support'));
const Zyno = lazy(() => import('./pages/Zyno'));
const JourneyCompleted = lazy(() => import('./pages/JourneyCompleted'));
const HomePage = lazy(() => import('./pages/HomePage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout enableWallet={false}>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

const WalletProtectedLayout = () => (
  <ProtectedRoute>
    <WalletContextProvider>
      <Layout enableWallet={true}>
        <Outlet />
      </Layout>
    </WalletContextProvider>
  </ProtectedRoute>
);

// Public demo flow: no real auth required; demo page will bootstrap a demo session.
const DemoLayout = () => (
  <Layout enableWallet={false}>
    <Outlet />
  </Layout>
);

const DebugMint = lazy(() => import('./pages/DebugMint'));

const RouteSkeleton = () => (
  <div className="flex min-h-[30vh] items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-200">
    Loading experience…
  </div>
);



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
          <Suspense fallback={<RouteSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public demo routes (explicitly separated from real journeys) */}
              <Route element={<DemoLayout />}>
                <Route path="journeys/demo" element={<JourneyDemo />} />
                <Route path="journeys/demo/:journeyId" element={<JourneyDemo />} />
              </Route>

              {/* Protected routes without wallet stack (lighter initial load) */}
              <Route element={<ProtectedLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="playground" element={<Playground />} />
                <Route path="resources" element={<Resources />} />
                <Route path="support" element={<Support />} />
                <Route path="zyno" element={<Zyno />} />
                <Route path="guide" element={<GuidePage />} />
              </Route>

              {/* Protected routes that need wallet/NFT features */}
              <Route element={<WalletProtectedLayout />}>
                <Route path="debug/mint" element={<DebugMint />} />
                <Route path="journeys" element={<Journey />} />
                <Route path="journeys/:journeyId" element={<Journey />} />
                <Route path="journeys/completed" element={<JourneyCompleted />} />
                <Route path="dao" element={<Dao />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </TutorialProvider>
    </AuthProvider>
  );
}

export default App;
