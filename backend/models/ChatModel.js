// models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true },
  userType: { 
    type: String, 
    enum: ['free', 'trial', 'premium'], 
    required: true },
  messages: [
    {
      content: { 
        type: String, 
        required: true },
      role: { 
        type: String, 
        enum: ['user', 'assistant','daily_insight'], 
        required: true },
        timestamp: { 
          type: Date, 
          default: Date.now 
        },
    },
  ],
  createdAt: { 
    type: Date, 
    default: Date.now },
  lastModified: { 
    type: Date, 
    default: Date.now },
});

chatSchema.statics.getTodayChatsCount = async function (userId) {
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const endOfDay = new Date().setHours(23, 59, 59, 999);

  const chat = await this.findOne({
    userId,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  return chat ? chat.messages.filter((msg) => msg.role === 'user').length : 0;
};

export default mongoose.model('Chat', chatSchema);