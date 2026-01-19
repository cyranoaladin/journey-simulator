/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import JourneyCard from './Journey/JourneyCard'
import { personas } from '../data/personas'

const supportHighlights = [
  {
    title: 'Orchestrated Learning',
    description: 'Zyno and the protocol agent mesh coordinate missions, resources, and feedback loops so every builder compounds faster.',
    bullets: [
      'Adaptive missions sequenced by the Cognitive Activation Protocol',
      'Real-time agent collaboration for strategy, code, and governance',
      'Proof signals that unlock deeper staking and DAO missions'
    ]
  },
  {
    title: 'Proof Becomes Capital',
    description: 'Each completed phase mints verifiable Proof-of-Skill credentials that level up access to talent, liquidity, and networked capital.',
    bullets: [
      'Mint NFTs that certify milestones across Solana, DePIN, and DeFi tracks',
      'Stake MFAI to access premium missions and sovereign capital pools',
      'Participate in Synaptic Governance with on-chain voting power'
    ]
  }
]

const JourneysPreview = () => {
  const navigate = useNavigate()

  const handlePersonaSelected = () => {
    navigate('/journeys')
  }

  return (
    <section id="personas" className="relative py-20">
      <div className="mx-auto w-full px-0 space-y-16 sm:px-2 lg:px-4 xl:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-space font-bold mb-6">
            Chart Your Mission Trajectory
          </h2>
          <p className="text-lg md:text-xl opacity-80 leading-relaxed mb-4">
            Choose the journey that matches your ambition. Each pathway is a curated stack of phases that transform prototype energy into verifiable Proof-of-Skill capital.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/journeys')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Open the Journey Dashboard</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {supportHighlights.map((highlight) => (
            <div key={highlight.title} className="glass-effect rounded-2xl p-6 text-left">
              <h3 className="text-xl font-semibold text-accent-cyan mb-3">{highlight.title}</h3>
              <p className="text-base text-white/80 mb-4 leading-relaxed">{highlight.description}</p>
              <ul className="space-y-2 text-sm text-white/70">
                {highlight.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="text-accent-cyan">{'>'}</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-semibold">Select Your Prototype Arena</h3>
              <p className="text-base opacity-70">Preview every mission, reward, and agent support layer before diving into the full dashboard.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/journeys')}
              className="btn-secondary"
            >
              View detailed roadmap 
            </motion.button>
          </div>

          <div className="grid gap-6">
            {personas.map((persona) => (
              <JourneyCard
                key={persona.id}
                persona={persona}
                onSelected={handlePersonaSelected}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default JourneysPreview
