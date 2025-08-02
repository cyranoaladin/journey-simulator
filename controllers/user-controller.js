const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

// Generate access token - short lived (15-60 minutes)
const generateAccessToken = (user) => {
    return jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      "mfaiapp",
      { expiresIn: '1h' } // Short-lived token
    );
  };

  // Generate refresh token - longer lived (days/weeks)
const generateRefreshToken = (user) => {
    // Create a random token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Set expiry date - 7 days from now
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    
    // Save to user
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    
    return refreshToken;
  };

  exports.registerUser = async (req, res) => {
    try {
      const { name, email, password, wallet_address, persona } = req.body;
  
      // Check if user already exists
      console.log(req.body);
      
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
  
      // Create user
      const user = await User.create({
        name,
        email,
        password,
        wallet_address,
        persona,
      });
  
      if (user) {
        // Generate refresh token
        const refreshToken = generateRefreshToken(user);
        await user.save(); // Save the refresh token to user
        
        res.status(201).json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            wallet_address: user.wallet_address,
            persona: user.persona,
          },
          accessToken: generateAccessToken(user),
          refreshToken
        });
      } else {
        res.status(400).json({ success: false, message: 'Invalid user data' });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: error.message
      });
    }
  };

  exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);

      // Find user by email
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) {
        return res.status(401).json({ success: false, message: '22222Invalid email or password' });
      }
  
      // Check if password is correct
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ success: false, message: '1111Invalid email or password' });
      }
  
      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({ success: false, message: 'Your account has been deactivated' });
      }
  
      // Generate tokens
      const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        "mfaiapp",
        { expiresIn: '1h' }
      );
      
      // Create a refresh token
      const refreshToken = crypto.randomBytes(40).toString('hex');
      
      // Save refresh token to user
      user.refreshToken = refreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await user.save();
      
      console.log(`✅ Login successful for ${user.email}`);
      console.log(`🔑 Generated access token (first 15 chars): ${accessToken.substring(0, 15)}...`);
      
      // Clear sensitive data
      const userToReturn = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address,
      };
      
      // Send response with tokens
      res.status(200).json({
        success: true,
        user: userToReturn,
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to login',
        error: error.message
      });
    }
  };

  exports.getUserProfile = async (req, res) => {
    try {
      console.log("🔍 Get user profile request received");
      
      // The user object should be attached to req by the protect middleware
      const user = req.user;
      
      if (!user) {
        console.log("❌ No user attached to request");
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log(`✅ Returning profile for user: ${user.email}`);
      
      // Return user data (excluding sensitive fields)
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          wallet_address: user.wallet_address,
          persona: user.persona,
        }
      });
    } catch (error) {
      console.error("🚨 Get profile error:", error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving user profile',
        error: error.message
      });
    }
  };

  exports.updateUserProfile = async (req, res) => {
    try {
      // Get user from the auth middleware
      const userId = req.user.id;
      
      // Check if a file was uploaded
      //const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      
      // Find user and update
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          ...(req.body.name && { name: req.body.name }),
          ...(req.body.email && { email: req.body.email }),
          ...(req.body.wallet_address && { wallet_address: req.body.wallet_address }),
          ...(req.body.persona && { persona: req.body.persona }),
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  };

  exports.deleteUser = async (req, res) => {
    try {
      // Only allow admins or the user themselves to delete their account
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this user'
        });
      }
  
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Soft delete - set is_active to false
      user.is_active = false;
      user.updatedAt = Date.now();
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  };

  exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({}).select('-password');
      
      res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  };

  exports.changeUserRole = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to change user roles'
        });
      }
  
      const { role } = req.body;
      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
  
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      user.role = role;
      user.updatedAt = Date.now();
      await user.save();
  
      res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to change user role',
        error: error.message
      });
    }
  };

  exports.subscription = async (res, req) => {
    try{
      const { subscription } = req.body;
      if (!subscription || !['gold', 'platinum', 'diamond'].includes(subscription)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription specified'
        });
      }

      const user = await User.findById(req.params.id)
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.subscription = subscription;
      user.subscription_date = Date.now();
      await user.save();
  
      res.status(200).json({
        success: true,
        message: `User subscription updated to ${subscription}`,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          subscription: user.subscription
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe user',
        error: error.message
      });
    }

  }