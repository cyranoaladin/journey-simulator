/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useJourneyStore } from '../../store/journeyStore';
import { Persona } from '../../types/journey';
import { generateStableKey } from '../../utils/generateStableKey';

interface InvestorDemoModeProps {
  readonly personas: Persona[];
}

export default function InvestorDemoMode({ personas }: InvestorDemoModeProps) {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);

  const { setSelectedPersona } = useJourneyStore();

  const demoSteps = [
    "Persona Selection",
    "Cognitive Activation Journey",
    "Tokenomics & Mechanisms",
    "Governance Simulations",
    "Results & Metrics"
  ];

  const handleDemoStart = async () => {
    if (!selectedPersonaId) return;

    setIsSimulating(true);

    try {
      // Find selected persona
      const persona = personas.find(p => p.id === selectedPersonaId);
      if (persona) {
        setSelectedPersona(persona);

        // Simulate some journey steps
        setTimeout(() => {
          setDemoData({
            totalXP: 2500,
            currentLevel: 4,
            completedPhases: ['learn', 'build', 'prove'],
            nftCertificates: [
              { id: 'proof_of_skill_1', name: 'Proof of Skill', description: 'Complete mission in Learn phase' },
              { id: 'proof_of_build_1', name: 'Proof of Build', description: 'Complete mission in Build phase' }
            ],
            tokenomicsScore: 8.5,
            governanceScore: 9.2,
            userEngagement: 7.8
          });
          setIsSimulating(false);
          setCurrentStep(demoSteps.length);
        }, 2000);
      }
    } catch (error) {
      console.error('Error launching demo mode:', error);
      setIsSimulating(false);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setDemoData(null);
    setIsDemoActive(false);
  };

  if (!isDemoActive) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsDemoActive(true)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
      >
        Investor Demo Mode
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Investor Demo Mode
            </h2>
            <button
              onClick={resetDemo}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-400 mt-2">
            Full simulation of a user journey in the Money Factory AI ecosystem
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Progression */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Demo Progression</span>
              <span>{currentStep}/{demoSteps.length} steps</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / demoSteps.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {demoSteps.map((step, index) => {
                const stepKey = `demo-step-${index}-${step}`;
                return (
                  <span
                    key={stepKey}
                    className={`text-center ${index <= currentStep ? 'text-cyan-400' : 'text-gray-600'}`}
                    style={{ width: `${100 / demoSteps.length}%` }}
                  >
                    {index + 1}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Persona Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Select a persona for the demo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <motion.div
                  key={persona.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPersonaId === persona.id
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/30'
                    }`}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{persona.icon}</div>
                    <div>
                      <h4 className="font-medium">{persona.title}</h4>
                      <p className="text-xs text-gray-500">{persona.targetProfile}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bouton de simulation */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleDemoStart}
              disabled={!selectedPersonaId || isSimulating}
              className={`px-6 py-3 rounded-lg font-medium ${selectedPersonaId && !isSimulating
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700'
                : 'bg-gray-800 cursor-not-allowed'
                }`}
            >
              {isSimulating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Simulation in progress...
                </span>
              ) : (
                "Start Simulation"
              )}
            </button>
          </div>

          {/* Simulation Results */}
          {demoData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold">Simulation Results</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-xl p-4 border border-cyan-500/20">
                  <div className="text-3xl font-bold text-cyan-400">{demoData.totalXP}</div>
                  <div className="text-sm text-gray-400">XP Accumulated</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-xl p-4 border border-cyan-500/20">
                  <div className="text-3xl font-bold text-cyan-400">{demoData.currentLevel}</div>
                  <div className="text-sm text-gray-400">Level Reached</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-xl p-4 border border-cyan-500/20">
                  <div className="text-3xl font-bold text-cyan-400">{demoData.completedPhases.length}/5</div>
                  <div className="text-sm text-gray-400">Phases Completed</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-medium mb-3">Proof-of-* NFTs Obtained</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demoData.nftCertificates.map((nft: any) => {
                    const nftKey = generateStableKey(nft, 'nft-certificate', ['name', 'id', 'mint_address']);
                    return (
                      <div key={nftKey} className="flex items-center p-3 bg-black/30 rounded-lg border border-white/10">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-lg"></span>
                        </div>
                        <div>
                          <div className="font-medium">{nft.name}</div>
                          <div className="text-xs text-gray-500">{nft.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-medium mb-3">Key Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tokenomics Score</span>
                      <span>{demoData.tokenomicsScore}/10</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(demoData.tokenomicsScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Governance Score</span>
                      <span>{demoData.governanceScore}/10</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(demoData.governanceScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Engagement</span>
                      <span>{demoData.userEngagement}/10</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(demoData.userEngagement / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 text-center text-sm text-gray-500">
          Money Factory AI - Journey Simulator  Investor Demo Mode
        </div>
      </motion.div>
    </motion.div>
  );
}
