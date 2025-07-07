import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../store/journeyStore';
import { Persona } from '../../types/journey';

interface JourneyCardProps {
  persona: Persona;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ persona }) => {
  const { setSelectedPersona, userProgress } = useJourneyStore();
  
  // Check if user has started this journey
  const hasStarted = userProgress.completedPhases.length > 0 && 
                    userProgress.currentPersona === persona.id;
  
  // Calculate progress percentage if journey has been started
  const progressPercentage = hasStarted 
    ? Math.min((userProgress.completedPhases.length / persona.phases.length) * 100, 100)
    : 0;

  // Get persona icon based on ID
  const getPersonaIcon = () => {
    switch (persona.id) {
      case 'curious-student':
        return '🎓';
      case 'web2-entrepreneur':
        return '💼';
      case 'web3-developer':
        return '⚡';
      case 'content-creator':
        return '🎨';
      case 'community-communicator':
        return '🗣️';
      case 'project-manager':
        return '🎯';
      case 'defi-explorer':
        return '📊';
      case 'nft-creator':
        return '🖼️';
      case 'investor':
        return '💰';
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
      onClick={() => setSelectedPersona(persona)}
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
          <div className="w-full h-1 bg-white/10 rounded-full mb-3">
            <div 
              className="h-full bg-gradient-primary rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        
        <div className="flex justify-between items-center mb-3 text-xs opacity-70">
          <span>{persona.phases.length} phases</span>
          {hasStarted && <span>{userProgress.completedPhases.length}/{persona.phases.length} completed</span>}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            persona.id === userProgress.currentPersona
              ? 'bg-gradient-primary text-white'
              : 'border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white'
          }`}
        >
          {persona.id === userProgress.currentPersona 
            ? (hasStarted ? 'Continue Journey' : 'Start Journey') 
            : 'Discover Journey'}
        </motion.button>
        
        {/* Testnet Ready Badge */}
        <div className="absolute -top-2 -right-2 bg-gradient-gold text-xs font-bold text-black px-2 py-1 rounded-full">
          Testnet Ready
        </div>
      </div>
    </motion.div>
  );
};

export default JourneyCard;