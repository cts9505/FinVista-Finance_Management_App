import mongoose from "mongoose";

const bugReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  screenshotUrl: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  browserInfo: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("BugReport", bugReportSchema);