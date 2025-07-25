import reviewModel from '../models/reviewModel.js';
import userModel from '../models/model.js';
import mongoose from 'mongoose';

// Submit a new review
export const createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    // Validate inputs
    if (!rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, title and comment'
      });
    }

    // Create new review
    const newReview = new reviewModel({
      userId,
      rating,
      title,
      comment
    });

    await newReview.save();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully and pending approval',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while submitting your review'
    });
  }
};

// Get all approved reviews for public display
export const getPublicReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find approved reviews, populate user info, sort by pinned and newest first
    const reviews = await reviewModel.find({ isApproved: true })
      .populate('userId', 'name image')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total approved reviews
    const totalReviews = await reviewModel.countDocuments({ isApproved: true });

    // Calculate average rating
    const aggregateResult = await reviewModel.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);
    
    const averageRating = aggregateResult.length > 0 
      ? Math.round(aggregateResult[0].averageRating * 10) / 10 
      : 0;

    // Rating distribution
    const ratingDistribution = await reviewModel.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    // Format the distribution
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasMore: page * limit < totalReviews
      },
      stats: {
        averageRating,
        distribution
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching reviews'
    });
  }
};

// Get user's own reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.userId;
    
    const reviews = await reviewModel.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching your reviews'
    });
  }
};

// Update user's own review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    // Validate inputs
    if (!rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, title and comment'
      });
    }

    // Find review and check ownership
    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update review
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    // When updated, set back to pending approval
    review.isApproved = false;
    
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully and pending approval',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating your review'
    });
  }
};

// Delete user's own review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find review and check ownership
    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete review
    await reviewModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting your review'
    });
  }
};

// ADMIN CONTROLLERS

// Get all reviews for admin (with filtering options)
export const getAdminReviews = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'all',
        minRating = 1,
        search = '',
        sort = 'newest',
      } = req.query;
  
      const query = {};
      
      // Status filter
      if (status === 'approved') {
        query.isApproved = true;
      } else if (status === 'pending') {
        query.isApproved = false;
      } else if (status === 'pinned') {
        query.isPinned = true;
      }
  
      // Minimum rating filter
      if (minRating && !isNaN(minRating)) {
        query.rating = { $gte: parseInt(minRating) };
      }
  
      // Search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { comment: { $regex: search, $options: 'i' } },
          // Add user name search if userId is populated
          { 'userId.name': { $regex: search, $options: 'i' } },
        ];
      }
  
      // Sorting
      const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        highest: { rating: -1 },
        lowest: { rating: 1 },
      };
      const sortBy = sortOptions[sort] || sortOptions.newest;
  
      const reviews = await reviewModel
        .find(query)
        .populate('userId', 'name image')
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      const total = await reviewModel.countDocuments(query);
  
      res.json({
        success: true,
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          limit: parseInt(limit),
          hasMore: page * limit < total,
        },
      });
    } catch (error) {
      console.error('Error fetching admin reviews:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// Approve/reject review
export const approveReview = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isApproved = isApproved;
    await review.save();

    return res.status(200).json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
      review
    });
  } catch (error) {
    console.error('Error approving/rejecting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// Pin/unpin review
export const togglePinReview = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const { id } = req.params;
    
    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isPinned = !review.isPinned;
    await review.save();

    return res.status(200).json({
      success: true,
      message: `Review ${review.isPinned ? 'pinned' : 'unpinned'} successfully`,
      review
    });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// Reply to review
export const replyToReview = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const { id } = req.params;
    const { reply } = req.body;
    
    if (!reply || reply.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reply content cannot be empty'
      });
    }

    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const user = await userModel.findById(req.userId);

    review.adminReply = {
      content: reply,
      repliedAt: new Date(),
      repliedBy: user.name
    };
    
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      review
    });
  } catch (error) {
    console.error('Error replying to review:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// Delete admin reply
export const deleteReply = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const { id } = req.params;
    
    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.adminReply = {
      content: null,
      repliedAt: null,
      repliedBy: null
    };
    
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Reply deleted successfully',
      review
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// Get review statistics for admin dashboard
export const getReviewStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Total reviews count
    const totalReviews = await reviewModel.countDocuments();
    
    // Approved reviews count
    const approvedReviews = await reviewModel.countDocuments({ isApproved: true });
    
    // Pending reviews count
    const pendingReviews = await reviewModel.countDocuments({ isApproved: false });
    
    // Average rating
    const aggregateResult = await reviewModel.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);
    
    const averageRating = aggregateResult.length > 0 
      ? Math.round(aggregateResult[0].averageRating * 10) / 10 
      : 0;

    // Rating distribution
    const ratingDistribution = await reviewModel.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    // Format the distribution
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });
    
    // Recent reviews
    const recentReviews = await reviewModel.find()
      .populate('userId', 'name email image')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Reviews with no reply
    const noReplyCount = await reviewModel.countDocuments({
      isApproved: true,
      'adminReply.content': null
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        averageRating,
        distribution,
        noReplyCount
      },
      recentReviews
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching review statistics'
    });
  }
};