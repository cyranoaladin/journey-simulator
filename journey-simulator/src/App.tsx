import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { WalletContextProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
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

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
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
      <WalletContextProvider>
        <div
          className={`min-h-screen transition-colors duration-300 ${
            isDark
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="journeys" element={<Journey />} />
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
      </WalletContextProvider>
    </AuthProvider>
  );
}

export default App;
