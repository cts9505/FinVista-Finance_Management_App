// Create this middleware in middlewares/premiumAuth.js
import userModel from '../models/model.js';

export const premiumFeatureAuth = async (req, res, next) => {
    try {
      const userId = req.userId;
      const user = await userModel.findById(userId);
      
      if (!user) {
        return res.json({ success: false, message: 'User not found!' });
      }
      
      // Check if premium or trial is active
      const now = new Date();
      
      if (!user.isPremium) {
        return res.json({ 
          success: false, 
          premiumRequired: true,
          message: 'This feature requires a premium subscription.' 
        });
      }
      
      if (user.subscriptionType === 'trial' && user.trialEndDate < now) {
        user.isPremium = false;
        user.subscriptionType = 'none';
        await user.save();
        
        return res.json({ 
          success: false, 
          premiumExpired: true,
          message: 'Your free trial has expired!' 
        });
      } 
      
      if ((user.subscriptionType === 'monthly' || user.subscriptionType === 'annually') && 
          user.subscriptionEndDate < now) {
        user.isPremium = false;
        user.subscriptionType = 'none';
        await user.save();
        
        return res.json({ 
          success: false, 
          premiumExpired: true,
          message: 'Your premium subscription has expired!' 
        });
      }
      
      next();
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  };

  export const isAdmin = async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID required! Please login",
        });
      }
  
      // Verify user is admin
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      if (!user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update reviews",
        });
      }
  
      // Attach user to req for downstream use
      req.user = user;
      next();
    } catch (error) {
      console.error("Admin verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while verifying admin status.",
      });
    }
  };

  export const userDataById = async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id).select('name image');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user: { _id: user._id, name: user.name, image: user.image } });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  export const getallUsers = async (req, res) => {
    try {
      const { userIds } = req.body;
      // Log incoming userIds for debugging
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or empty user IDs' });
      }
      // Validate ObjectIds
      const validIds = userIds.filter((id) => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
      if (validIds.length === 0) {
        console.warn('No valid user IDs provided:', userIds);
        return res.status(400).json({ success: false, message: 'No valid user IDs provided' });
      }
      const users = await userModel.find({ _id: { $in: validIds } }).select('name image');
      const usersMap = users.reduce((acc, user) => ({
        ...acc,
        [user._id]: {
          _id: user._id,
          name: user.name,
          image: user.image || null,
        },
      }), {});
      // Return users for requested IDs, with null for missing users
      const result = userIds.map((id) => usersMap[id] || { _id: id, name: 'Unknown User', image: null });
      res.json({ success: true, users: result });
    } catch (error) {
      console.error('Error fetching users batch:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }