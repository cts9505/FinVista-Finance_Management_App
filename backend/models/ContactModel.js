// models/ContactModel.js

import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["general", "security", "account", "sales", "support", "other"]
  },
  subject: {
    type: String,
    required: [true, "Subject is required"]
  },
  message: {
    type: String,
    required: [true, "Message is required"]
  },
  imageUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    default: ""
  }
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;