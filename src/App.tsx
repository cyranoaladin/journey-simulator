import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'
import { WalletContextProvider } from './contexts/WalletContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HeroSection from './components/HeroSection'
import JourneysPage from './components/JourneysPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import SkillchainBanner from './components/SkillchainBanner'
import AccessPassHolders from './components/AccessPassHolders'
import Footer from './components/Footer'
import JourneyModal from './components/JourneyModal'
import ZynoAssistant from './components/ZynoAssistant'
import WalletConnectionBanner from './components/WalletConnectionBanner'
import BackToTopButton from './components/BackToTopButton'
import ZynoConsole from './components/Zyno/ZynoConsole'
import PlaygroundPage from './components/PlaygroundPage'
import { initParticles } from './utils/particles'
import AppLayout from './components/AppLayout'
import JourneysPreview from './components/JourneysPreview'

function App() {
  const { isDark } = useThemeStore()
  useEffect(() => {
    initParticles()
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <AuthProvider>
      <WalletContextProvider>
        <div className={`min-h-screen transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white' 
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900'
        }`}>
          <div
            id="particles-js"
            className="pointer-events-none fixed inset-0 -z-10"
            aria-hidden="true"
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <WalletConnectionBanner />
                  <SkillchainBanner />
                  
                  <main className="relative">
                    <HeroSection />
                    <JourneysPreview />
                    <AccessPassHolders />
                  </main>

                  <Footer />
                  <JourneyModal />
                  <ZynoAssistant />
                  <BackToTopButton />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/playground" element={
              <ProtectedRoute>
                <AppLayout>
                  <WalletConnectionBanner />
                  <SkillchainBanner />

                  <main className="relative">
                    <PlaygroundPage />
                  </main>

                  <Footer />
                  <JourneyModal />
                  <ZynoAssistant />
                  <BackToTopButton />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/journeys" element={
              <ProtectedRoute>
                <AppLayout>
                  <WalletConnectionBanner />
                  <SkillchainBanner />
                  
                  <main className="relative">
                    <JourneysPage />
                  </main>

                  <Footer />
                  <JourneyModal />
                  <ZynoAssistant />
                  <BackToTopButton />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/zyno" element={
              <ProtectedRoute>
                <AppLayout>
                  <WalletConnectionBanner />
                  <SkillchainBanner />

                  <main className="relative">
                    <section className="max-w-6xl mx-auto px-4 py-10">
                      <ZynoConsole />
                    </section>
                  </main>

                  <Footer />
                  <JourneyModal />
                  <ZynoAssistant />
                  <BackToTopButton />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </WalletContextProvider>
    </AuthProvider>
  )
}

export default App