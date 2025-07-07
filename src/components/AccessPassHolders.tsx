import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { holders } from '../data/holders';
import { useJourneyStore } from '../store/journeyStore';
import { Trophy, TrendingUp, Zap, Users, ExternalLink } from 'lucide-react';

const AccessPassHolders: React.FC = () => {
  const { openModal } = useJourneyStore();
  const [hoveredHolder, setHoveredHolder] = useState<string | null>(null);

  const openHolderModal = (holderId: string) => {
    const holder = holders.find(h => h.id === holderId);
    if (holder) {
      openModal({
        type: 'holder',
        holder
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary-900/50 via-primary-800/30 to-primary-700/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-space font-bold mb-6">
            <span className="gradient-text">
              MFAI Access Pass Holders
            </span>
          </h2>
          <p className="text-lg opacity-80 max-w-3xl mx-auto">
            Meet the pioneers who transformed their skills into digital sovereignty through the <span className="font-semibold text-accent-cyan">Cognitive Activation Protocol™</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {holders.map((holder, index) => (
            <motion.div
              key={holder.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredHolder(holder.id)}
              onHoverEnd={() => setHoveredHolder(null)}
              onClick={() => openHolderModal(holder.id)}
              className="builders-circle-card card cursor-pointer"
            >
              <div className={`builders-circle-badge bg-gradient-to-br ${
                holder.passLevel === 'Diamond' ? 'from-blue-400 to-purple-600' :
                holder.passLevel === 'Platinum' ? 'from-gray-300 to-blue-300' :
                'from-yellow-400 to-orange-500'
              }`}>
                <div className="absolute top-2 right-2 text-xs font-bold bg-black/30 text-white px-2 py-1 rounded-full">
                  {holder.passLevel} Pass Holder
                </div>
                
                <div className={`builders-circle-avatar ${
                  holder.passLevel === 'Diamond' ? 'bg-gradient-diamond' :
                  holder.passLevel === 'Platinum' ? 'bg-gradient-platinum' :
                  'bg-gradient-gold'
                }`}>
                  {holder.avatar}
                </div>
                
                <h3 className="text-xl font-space font-bold text-white mb-1">{holder.name}</h3>
                <p className="text-white/90 font-medium">{holder.title}</p>
              </div>
              
              <div className="builders-circle-metrics">
                <div className="builders-circle-metric">
                  <div className="text-sm opacity-70">Time in ecosystem</div>
                  <div className="font-bold">{holder.duration}</div>
                </div>
                <div className="builders-circle-metric">
                  <div className="text-sm opacity-70">Certifications</div>
                  <div className="font-bold">{holder.certifications}</div>
                </div>
                <div className="builders-circle-metric">
                  <div className="text-sm opacity-70">ROI</div>
                  <div className="font-bold text-green-400">{holder.roi}</div>
                </div>
                <div className="builders-circle-metric">
                  <div className="text-sm opacity-70">Projects</div>
                  <div className="font-bold">{holder.projects}</div>
                </div>
              </div>
              
              <div className="builders-circle-testimonial">
                <p className="text-sm italic">
                  "{holder.testimonial.substring(0, 120)}..."
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="builders-circle-cta bg-gradient-primary text-white"
              >
                <span>View Success Story</span>
              </motion.button>
              
              {/* Flip hint */}
              <div className="absolute bottom-2 right-2 text-xs text-white/40">
                Tap to flip
              </div>
              
              {/* Hover Card - Additional Details */}
              <AnimatePresence>
                {hoveredHolder === holder.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm p-6 flex flex-col justify-between rounded-xl"
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          holder.passLevel === 'Diamond' ? 'bg-gradient-diamond' :
                          holder.passLevel === 'Platinum' ? 'bg-gradient-platinum' :
                          'bg-gradient-gold'
                        }`}>
                          {holder.avatar}
                        </div>
                        <div>
                          <h3 className="font-space font-bold text-white">{holder.name}</h3>
                          <p className="text-white/80">{holder.title}</p>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-white mb-2">Key Achievements</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-white/90">
                          <Trophy size={14} className="text-accent-gold" />
                          <span>Time in ecosystem: {holder.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-white/90">
                          <TrendingUp size={14} className="text-accent-green" />
                          <span>ROI since joining: {holder.roi}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-white/90">
                          <Zap size={14} className="text-accent-cyan" />
                          <span>{holder.metrics[4]?.label}: {holder.metrics[4]?.value}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-primary text-white flex items-center justify-center space-x-2"
                      >
                        <ExternalLink size={16} />
                        <span>Full Success Story</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccessPassHolders;