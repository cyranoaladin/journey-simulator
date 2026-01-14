/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Feature flag middleware for gradual feature rollout
const featureFlags = {
  // Core features (always enabled)
  userAuthentication: true,
  journeyProgress: true,
  nftMinting: true,

  // New features (can be toggled)
  analytics: true,
  platformStats: true,
  holderInteractions: true,
  certificateTracking: true,

  // Experimental features (disabled by default)
  aiRecommendations: false,
  socialFeatures: false,
  advancedAnalytics: false,
  betaFeatures: false,

  // A/B testing features
  newUI: false,
  enhancedAnimations: false,
  mobileOptimizations: false,
};

// Middleware to check feature flags
const checkFeatureFlag = (featureName) => {
  return (req, res, next) => {
    if (featureFlags[featureName]) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Feature '${featureName}' is currently disabled`,
        feature: featureName
      });
    }
  };
};

// Middleware to add feature flags to response
const addFeatureFlags = (req, res, next) => {
  res.locals.featureFlags = featureFlags;
  next();
};

// Admin endpoint to update feature flags
const updateFeatureFlag = (req, res) => {
  const { feature, enabled } = req.body;

  if (featureFlags.hasOwnProperty(feature)) {
    featureFlags[feature] = enabled;
    res.json({
      success: true,
      message: `Feature '${feature}' ${enabled ? 'enabled' : 'disabled'}`,
      featureFlags
    });
  } else {
    res.status(400).json({
      success: false,
      message: `Feature '${feature}' not found`
    });
  }
};

module.exports = {
  checkFeatureFlag,
  addFeatureFlags,
  updateFeatureFlag,
  featureFlags
};
