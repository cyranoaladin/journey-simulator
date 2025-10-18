import { useEffect } from 'react'
import { useJourneyStore } from './store/journeyStore'
import { useThemeStore } from './store/themeStore'
import { WalletContextProvider } from './contexts/WalletContext'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import JourneysPage from './components/JourneysPage'
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
    <WalletContextProvider>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900'
      }`}>
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
    </WalletContextProvider>
  )
}

export default App