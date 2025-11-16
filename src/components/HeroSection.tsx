import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Sparkles, TrendingUp, Users, Award } from 'lucide-react'
// import { useJourneyStore } from '../store/journeyStore' // Will be used when needed
import SkillchainCard from './SkillchainCard'
import WalletConnectionGuide from './WalletConnectionGuide'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'
// import { api } from '../utils/api' // Will be used when backend is ready

const HeroSection = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalNFTs: 0,
    totalXP: 0,
    activeJourneys: 0
  })

  // Load platform stats from backend
  const loadPlatformStats = async () => {
    try {
      // Simulate platform stats (for now)
      console.log('Fetching platform stats from backend...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Set mock data for now
      setPlatformStats({
        totalUsers: 1250,
        totalNFTs: 3400,
        totalXP: 125000,
        activeJourneys: 89
      });
    } catch (err) {
      console.error('Failed to load platform stats:', err)
    }
  }

  useEffect(() => {
    // Create particles container
    const particlesContainer = document.createElement('div')
    particlesContainer.id = 'particles-js'
    particlesContainer.className = 'absolute inset-0 z-0'
    
    const heroElement = document.getElementById('hero')
    if (heroElement && !document.getElementById('particles-js')) {
      heroElement.appendChild(particlesContainer)
    }

    // Load platform stats
    loadPlatformStats()
  }, [])

  const scrollToPersonas = () => {
    const element = document.querySelector('#personas')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleUnlockSovereignty = () => {
    navigate('/journeys')
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-primary-800/30 to-primary-700/50" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-6xl font-space font-bold mb-6"
            >
              <span className="gradient-text">
                Your Journey in the Proof Economy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl"
            >
              Discover how Money Factory AI transforms your skills into capital 
              through the <span className="font-semibold text-accent-cyan">Cognitive Activation Protocol™</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToPersonas}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Sparkles size={20} />
                <span>Explore journeys</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center justify-center space-x-2"
                onClick={handleUnlockSovereignty}
              >
                <Sparkles size={20} />
                <span>Unlock your digital sovereignty</span>
              </motion.button>
            </motion.div>

            {/* Platform Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="text-accent-cyan" size={20} />
                </div>
                <div className="text-lg font-bold">{platformStats.totalUsers.toLocaleString()}</div>
                <div className="text-xs opacity-70">Active Users</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="text-accent-gold" size={20} />
                </div>
                <div className="text-lg font-bold">{platformStats.totalNFTs.toLocaleString()}</div>
                <div className="text-xs opacity-70">NFTs Minted</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="text-accent-purple" size={20} />
                </div>
                <div className="text-lg font-bold">{platformStats.totalXP.toLocaleString()}</div>
                <div className="text-xs opacity-70">Total XP</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="text-accent-cyan" size={20} />
                </div>
                <div className="text-lg font-bold">{platformStats.activeJourneys}</div>
                <div className="text-xs opacity-70">Active Journeys</div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="text-sm italic opacity-70 font-space"
            >
              "You don't pitch. You prove. And your proof becomes capital."
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mt-6 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70 lg:justify-start"
            >
              <span>Powered by</span>
              <img src="/images/solana.svg" alt="Solana" className="h-6 w-6" />
              <span>Solana</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="mt-8 flex justify-center lg:justify-start"
            >
              <img 
                src="/images/logo_mfai.png" 
                alt="Money Factory AI" 
                className="max-w-full h-auto max-h-[150px] rounded-lg shadow-lg"
              />
            </motion.div>
          </motion.div>

          {/* Skillchain Card Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col items-center justify-center lg:justify-end space-y-6"
          >
            <div className="w-80">
              <SkillchainCard />
            </div>
            
            {!connected && (
              <div className="w-full max-w-md">
                <WalletConnectionGuide />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToPersonas}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 hover:text-white transition-colors"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={32} />
        </motion.div>
      </motion.button>
    </section>
  )
}

export default HeroSection