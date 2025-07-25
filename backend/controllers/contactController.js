// contactController.js

import Contact from "../models/ContactModel.js";
import userModel from "../models/model.js";
import { validationResult } from "express-validator";

// Submit a contact request
export const submitContactRequest = async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    
    // Create contact request
    const newContact = new Contact({
      name,
      email,
      category,
      subject,
      message,
      imageUrl: req.fileUrl || null, // Set by the imageController middleware
      createdAt: new Date()
    });
    
    await newContact.save();
    
    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully. We'll get back to you soon.",
      data: newContact
    });
  } catch (error) {
    console.error("Error submitting contact request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Get all contact requests (admin only)
export const getAllContactRequests = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID Required! Please Login"
      });
    }

    const user = await userModel.findById(userId);

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
    
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error("Error getting contact requests:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Update contact request status (admin only)
export const updateContactRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
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
        message: "You don't have permission to update contact requests"
      });
    }

    // Find and update the contact request
    const contactRequest = await Contact.findById(id);
    
    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found"
      });
    }

    // Update fields if provided
    if (status) {
      contactRequest.status = status;
      if (status === "resolved") {
        contactRequest.resolvedAt = new Date();
      }
    }
    
    if (adminNotes !== undefined) {
      contactRequest.adminNotes = adminNotes;
    }

    await contactRequest.save();

    return res.status(200).json({
      success: true,
      message: "Contact request updated successfully",
      data: contactRequest
    });
  } catch (error) {
    console.error("Error updating contact request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// Get contact requests by email
export const getContactRequestsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    const contacts = await Contact.find({ email }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error("Error getting contact requests by email:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};