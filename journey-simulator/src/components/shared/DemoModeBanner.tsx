import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import { useJourneyStore } from '../../store/journeyStore'

const DemoModeBanner = () => {
  const { runMode, toggleDemoMode } = useJourneyStore()
  const [isVisible, setIsVisible] = React.useState(true)

  if (runMode !== 'demo' || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-0 right-0 z-40 bg-yellow-500/10 border-b border-yellow-500/30 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-yellow-400" size={20} />
              <p className="text-sm text-yellow-300">
                <span className="font-semibold">Demo Mode Active:</span> This is a demo-only workflow. 
                <button 
                  onClick={toggleDemoMode}
                  className="ml-2 underline hover:text-yellow-200 transition-colors"
                >
                  Switch to Real Mode
                </button>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVisible(false)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DemoModeBanner
