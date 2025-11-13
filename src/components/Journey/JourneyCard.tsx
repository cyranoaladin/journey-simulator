import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../store/journeyStore';
import { Persona } from '../../types/journey';
import { api } from '../../utils/api';

interface JourneyCardProps {
  persona: Persona;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ persona }) => {
  const { setSelectedPersona, userProgress, loadUserProgress } = useJourneyStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user has started this journey
  const hasStarted = userProgress.completedPhases.length > 0 && 
                    userProgress.currentPersona === persona.id;
  
  // Calculate progress percentage if journey has been started
  const progressPercentage = hasStarted 
    ? Math.min((userProgress.completedPhases.length / persona.phases.length) * 100, 100)
    : 0;

  // Handle persona selection with backend sync
  const handlePersonaSelection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Set persona in store
      setSelectedPersona(persona);
      
      // Update user profile with selected persona in backend
      await api.updateUserProfile({ persona: persona.id as any });
      
      // Reload user progress to get latest data
      await loadUserProgress();
      
    } catch (error) {
      console.error('Failed to select persona:', error);
      setError('Failed to select journey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get persona icon based on ID
  const getPersonaIcon = () => {
    switch (persona.id) {
      case 'cognitive-activation-hub':
        return '🧠';
      case 'capital-foundry':
        return '🏛️';
      case 'system-architect':
        return '🛠️';
      case 'experience-studio':
        return '🎮';
      case 'impact-engine':
        return '🌍';
      case 'resilience-master':
        return '🛡️';
      default:
        return persona.icon;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`card cursor-pointer transition-all duration-300 ${
        persona.id === userProgress.currentPersona 
          ? 'ring-2 ring-primary-500 bg-white/10' 
          : 'hover:bg-white/10'
      }`}
      onClick={handlePersonaSelection}
    >
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${persona.color} flex items-center justify-center text-2xl`}>
          {getPersonaIcon()}
        </div>
        
        <h3 className="text-xl font-space font-semibold mb-2">
          {persona.title}
        </h3>
        
        <p className="text-sm opacity-80 mb-4 leading-relaxed">
          {persona.description}
        </p>
        
        <div className="text-xs opacity-60 mb-4">
          <strong>Target profile:</strong> {persona.targetProfile}
        </div>
        
        {/* Progress bar if journey started */}
        {hasStarted && (
          <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full origin-left"
              initial={false}
              animate={{ scaleX: Math.max(0, Math.min(1, progressPercentage / 100)) }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
        
        <div className="flex justify-between items-center mb-3 text-xs opacity-70">
          <span>{persona.phases.length} phases</span>
          {hasStarted && <span>{userProgress.completedPhases.length}/{persona.phases.length} completed</span>}
        </div>
        
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            isLoading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : persona.id === userProgress.currentPersona
                ? 'bg-gradient-primary text-white'
                : 'border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Selecting...</span>
            </div>
          ) : (
            persona.id === userProgress.currentPersona 
              ? (hasStarted ? 'Continue Journey' : 'Start Journey') 
              : 'Discover Journey'
          )}
        </motion.button>
        
        {/* Error Display */}
        {error && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300">
            {error}
          </div>
        )}
        
        {/* Testnet Ready Badge */}
        <div className="absolute -top-2 -right-2 bg-gradient-gold text-xs font-bold text-black px-2 py-1 rounded-full">
          Testnet Ready
        </div>
      </div>
    </motion.div>
  );
};

export default JourneyCard;