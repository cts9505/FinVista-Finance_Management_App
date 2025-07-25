import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    used: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: "💰",
    },
    period: {
      type: String,
      required: true,
      enum: ["monthly", "quarterly", "biannual", "annual", "custom"],
      default: "monthly",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    alert10PercentSent: {
      type: Boolean,
      default: false,
    },
    alertExhaustedSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// export default mongoose.model("Budget", budgetSchema);

const BudgetModel = mongoose.model('Budget', budgetSchema);
  
export default BudgetModel;