import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useJourneyStore } from './store/journeyStore'
import { useThemeStore } from './store/themeStore'
import { WalletContextProvider } from './contexts/WalletContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
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
import { initParticles } from './utils/particles'

function App() {
  const { isDark } = useThemeStore()
  const { selectedPersona } = useJourneyStore()

  useEffect(() => {
    const cleanup = initParticles()

    return () => {
      cleanup?.()
    }
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
                <div>
                  <Header />
                  <WalletConnectionBanner />
                  <SkillchainBanner />
                  
                  <main className="relative">
                    {!selectedPersona && <HeroSection />}
                    
                    <JourneysPage />
                    
                    {!selectedPersona && <AccessPassHolders />}
                  </main>

                  <Footer />
                  <JourneyModal />
                  <ZynoAssistant />
                  <BackToTopButton />
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/journeys" element={
              <ProtectedRoute>
                <div>
                  <Header />
                  <WalletConnectionBanner />
                  <SkillchainBanner />
                  
                  <main className="relative">
                    {!selectedPersona && <HeroSection />}
                    
                    <JourneysPage />
                    
                    {!selectedPersona && <AccessPassHolders />}
                  </main>

                  <Footer />
                  <JourneyModal />
                  <ZynoAssistant />
                  <BackToTopButton />
                </div>
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