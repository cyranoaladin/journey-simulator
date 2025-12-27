const User = require('../models/user');
const Journey = require('../models/Journeys');

// Track certification downloads
exports.trackCertificationDownload = async (req, res) => {
  try {
    const { certification_id, phase, download_timestamp } = req.body;
    const userId = req.user.id;

    // Log the download event
    console.log(`User ${userId} downloaded certification ${certification_id} at ${download_timestamp}`);

    // Update user's download count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'analytics.certification_downloads': 1 },
      $push: {
        'analytics.download_history': {
          certification_id,
          phase,
          timestamp: download_timestamp
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Download tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking certification download:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track download'
    });
  }
};

// Track certification shares
exports.trackCertificationShare = async (req, res) => {
  try {
    const { certification_id, platform, phase, share_timestamp } = req.body;
    const userId = req.user.id;

    // Log the share event
    console.log(`User ${userId} shared certification ${certification_id} on ${platform} at ${share_timestamp}`);

    // Update user's share count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'analytics.certification_shares': 1 },
      $push: {
        'analytics.share_history': {
          certification_id,
          platform,
          phase,
          timestamp: share_timestamp
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Share tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking certification share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track share'
    });
  }
};

// Track holder interactions
exports.trackHolderInteraction = async (req, res) => {
  try {
    const { holder_id, interaction_type, timestamp } = req.body;
    const userId = req.user.id;

    // Log the interaction
    console.log(`User ${userId} interacted with holder ${holder_id} (${interaction_type}) at ${timestamp}`);

    // Update user's interaction count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'analytics.holder_interactions': 1 },
      $push: {
        'analytics.interaction_history': {
          holder_id,
          interaction_type,
          timestamp
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking holder interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction'
    });
  }
};

// Get access pass holders
exports.getAccessPassHolders = async (req, res) => {
  try {
    // Get users with access passes (non-free subscriptions)
    const holders = await User.find({
      'subscription': { $ne: 'free plan' }
    }).select('name email subscription total_xp nft_certificates createdAt').sort({ total_xp: -1 });

    // Format holders data
    const formattedHolders = holders.map(holder => ({
      id: holder._id,
      name: holder.name,
      email: holder.email,
      subscription: holder.subscription,
      totalXP: holder.total_xp || 0,
      nftCount: holder.nft_certificates?.length || 0,
      joinDate: holder.createdAt,
      achievements: holder.nft_certificates || []
    }));

    res.status(200).json({
      success: true,
      holders: formattedHolders
    });
  } catch (error) {
    console.error('Error fetching access pass holders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holders'
    });
  }
};

// Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total NFTs minted
    const usersWithNFTs = await User.find({ 'nft_certificates.0': { $exists: true } });
    const totalNFTs = usersWithNFTs.reduce((sum, user) => sum + (user.nft_certificates?.length || 0), 0);

    // Get total XP across all users
    const users = await User.find({}, 'total_xp');
    const totalXP = users.reduce((sum, user) => sum + (user.total_xp || 0), 0);

    // Get active journeys (users with completed phases)
    const activeJourneys = await User.countDocuments({
      'completed_phases': { $gt: 0 }
    });

    const stats = {
      totalUsers,
      totalNFTs,
      totalXP,
      activeJourneys
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics'
    });
  }
};
