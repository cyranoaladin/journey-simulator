import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ExternalLink, RefreshCw, TrendingUp, Trophy, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { holders } from '../data/holders';
import { useJourneyStore } from '../store/journeyStore';
import { logger } from '../utils/logger';

const AccessPassHolders: React.FC = () => {
  const { openModal } = useJourneyStore();
  const [hoveredHolder, setHoveredHolder] = useState<string | null>(null);
  const [holdersData, setHoldersData] = useState(holders);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load holders data from backend
  const loadHoldersData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch holders from backend (simulated for now)
      logger.debug('Fetching access pass holders from backend...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // For now, use local data
      setHoldersData(holders);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load holders data:', err);
      setError('Failed to load holders data. Using cached data.');
      setHoldersData(holders); // Use local data as fallback
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh holders data every 5 minutes
  useEffect(() => {
    loadHoldersData();

    const interval = setInterval(loadHoldersData, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Handle holder interaction tracking
  const trackHolderInteraction = async (holderId: string, interactionType: string) => {
    try {
      // Simulate tracking (for now)
      logger.debug('Tracking holder interaction:', {
        holder_id: holderId,
        interaction_type: interactionType,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to track holder interaction:', err);
    }
  };

  const openHolderModal = (holderId: string) => {
    const holder = holdersData.find(h => h.id === holderId);
    if (holder) {
      // Track interaction
      trackHolderInteraction(holderId, 'modal_open');

      openModal({
        type: 'holder',
        holder
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary-900/50 via-primary-800/30 to-primary-700/50">
      <div className="mx-auto w-full px-0 sm:px-2 lg:px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-space font-bold mb-6">
                <span className="gradient-text">
                  MFAI Access Pass Holders
                </span>
              </h2>
              <p className="text-lg opacity-80 max-w-3xl mx-auto">
                Meet the pioneers who transformed their skills into digital sovereignty through the <span className="font-semibold text-accent-cyan">Cognitive Activation Protocol™</span>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <span className="text-sm opacity-60">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadHoldersData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? 'animate-spin' : ''}
                />
                <span className="text-sm">Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-red-400" size={16} />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid gap-8">
          {holdersData.map((holder, index) => (
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
              {(() => {
                let badgeGradient = 'from-yellow-400 to-orange-500';
                if (holder.passLevel === 'Diamond') {
                  badgeGradient = 'from-blue-400 to-purple-600';
                } else if (holder.passLevel === 'Platinum') {
                  badgeGradient = 'from-gray-300 to-blue-300';
                }
                return (
                  <div className={`builders-circle-badge bg-gradient-to-br ${badgeGradient}`}>
                    <div className="absolute top-2 right-2 text-xs font-bold bg-black/30 text-white px-2 py-1 rounded-full">
                      {holder.passLevel} Pass Holder
                    </div>

                    {(() => {
                      let avatarGradient = 'bg-gradient-gold';
                      if (holder.passLevel === 'Diamond') {
                        avatarGradient = 'bg-gradient-diamond';
                      } else if (holder.passLevel === 'Platinum') {
                        avatarGradient = 'bg-gradient-platinum';
                      }
                      return (
                        <div className={`builders-circle-avatar ${avatarGradient}`}>
                          {holder.avatar}
                        </div>
                      );
                    })()}

                    <h3 className="text-xl font-space font-bold text-white mb-1">{holder.name}</h3>
                    <p className="text-white/90 font-medium">{holder.title}</p>
                  </div>
                );
              })()}

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
                        {(() => {
                          let hoverAvatarGradient = 'bg-gradient-gold';
                          if (holder.passLevel === 'Diamond') {
                            hoverAvatarGradient = 'bg-gradient-diamond';
                          } else if (holder.passLevel === 'Platinum') {
                            hoverAvatarGradient = 'bg-gradient-platinum';
                          }
                          return (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${hoverAvatarGradient}`}>
                              {holder.avatar}
                            </div>
                          );
                        })()}
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
