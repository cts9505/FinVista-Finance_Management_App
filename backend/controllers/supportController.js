// Description: This file contains the controller functions for handling support-related actions such as subscribing to a newsletter, reporting bugs, and managing bug reports. It includes functions for both users and admins to interact with the system.
// supportController.js

import Newsletter from "../models/NewsLetterModel.js";
import BugReport from "../models/BugReportModel.js";
import { validationResult } from "express-validator";
import { register } from "./authController.js";
import userModel from "../models/model.js";

// Subscribe to newsletter
export const subscribeNewsletter = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }
  
      // Check if email already exists
      const existingSubscriber = await Newsletter.findOne({ email });
      if (existingSubscriber) {
        return res.status(400).json({
          success: false,
          message: "Email is already subscribed to our newsletter"
        });
      }
  
      // Create new subscriber
      const newSubscriber = new Newsletter({
        email,
        subscribedAt: new Date()
      });
  
      await newSubscriber.save();
  
      return res.status(201).json({
        success: true,
        message: "Successfully subscribed to newsletter"
      });
    } catch (error) {
      console.error("Error in newsletter subscription:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later."
      });
    }
  };

// Get all newsletter subscribers (admin only)
export const getAllNewsletterSubscribers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this resource"
      });
    }
    
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error("Error getting newsletter subscribers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Report a bug
export const reportBug = async (req, res) => {
  try {
    const { title, description, deviceInfo, browserInfo, priority } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }
    
    // Create bug report
    const newBugReport = new BugReport({
      title,
      description,
      reportedBy: req.userId,
      screenshotUrl: req.fileUrl || null, // Set by the imageController middleware
      deviceInfo,
      browserInfo,
      priority: priority || "medium",
      status: "open",
      createdAt: new Date()
    });
    
    await newBugReport.save();
    
    return res.status(201).json({
      success: true,
      message: "Bug report submitted successfully",
      data: newBugReport
    });
  } catch (error) {
    console.error("Error reporting bug:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Get all bug reports (admin only)
export const getAllBugReports = async (req, res) => {
    try {
      const userId = req.userId; // Extracted from middleware
      if (!userId) {
          return res.json({ success: false, message: "User ID Required! Please Login" });
      }
  
      const user = await userModel.findById(userId);  // Await the promise to get user
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      // Check if user is admin
      if (!user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access this resource"
        });
      }
      
      const reports = await BugReport.find()
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      console.error("Error getting bug reports:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later."
      });
    }
  };

// Update bug report (admin only)
export const updateBugReport = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, priority, adminNotes } = req.body;
      const userId = req.userId;
  
      // Verify user is admin
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      if (!user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update bug reports"
        });
      }
  
      // Find and update the bug report
      const bugReport = await BugReport.findById(id);
      
      if (!bugReport) {
        return res.status(404).json({
          success: false,
          message: "Bug report not found"
        });
      }
  
      // Update fields if provided
      if (status) bugReport.status = status;
      if (priority) bugReport.priority = priority;
      if (adminNotes !== undefined) bugReport.note = adminNotes;
      
      // Add last updated timestamp and by whom
      bugReport.updatedAt = new Date();
      bugReport.updatedBy = userId;
  
      await bugReport.save();
  
      return res.status(200).json({
        success: true,
        message: "Bug report updated successfully",
        data: bugReport
      });
    } catch (error) {
      console.error("Error updating bug report:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later."
      });
    }
  };

  export const getUserBugReport = async (req, res) => {
    try {
      const userId = req.userId; // Extracted from authentication middleware
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID required! Please login',
        });
      }
  
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      // Fetch bug reports where reportedBy matches the userId
      const bugReports = await BugReport.find({ reportedBy: userId })
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 });
  
      return res.status(200).json({
        success: true,
        count: bugReports.length,
        data: bugReports,
      });
    } catch (error) {
      console.error('Error fetching user bug reports:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  };

export const checkUserAdmin = async (req, res) => {
    try {
        const userId = req.userId; // Extracted from middleware
        if (!userId) {
            return res.json({ success: false, message: "User ID Required! Please Login" });
        }
    
        const user = await userModel.findById(userId);  // Await the promise to get user
    
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
    
        // Check if user is admin
        if (!user.isAdmin) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to access this resource"
          });
        }
        
        return res.status(200).json({
          success: true,
          isAdmin:true,
          message:"Admin Accessed!"
        });
      } catch (error) {
        console.error("Error getting bug reports:", error);
        return res.status(500).json({
          success: false,
          message: "Server error. Please try again later."
        });
      }
};