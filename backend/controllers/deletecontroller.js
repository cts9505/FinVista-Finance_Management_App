import ExpenseModel from "../models/ExpenseModel.js";
import IncomeModel from "../models/IncomeModel.js";
import BillModel from "../models/BillModel.js";
import BudgetModel from "../models/BudgetModel.js";
import userModel from "../models/model.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import transporter from "../config/mailer.js";
// Helper function to send confirmation email
const sendConfirmationEmail = async (user, type) => {
  let subject, content;
  
  if (type === "account") {
    subject = "Your Account Has Been Deactivated";
    content = `
      <h2>Account Deactivation Confirmation</h2>
      <p>Hello ${user?.name},</p>
      <p>Your account has been successfully deactivated as requested. Your data will be permanently deleted after 7 days.</p>
      <p>If you wish to reactivate your account, simply log in within the next 7 days, and your account will be restored.</p>
      <p>If you have any questions or concerns, please contact our support team.</p>
      <p>Thank you for using our service.</p>
    `;
  } else {
    subject = `Your ${type} Data Has Been Deleted`;
    content = `
      <h2>Data Deletion Confirmation</h2>
      <p>Hello ${user?.name},</p>
      <p>We're confirming that all your ${type} data has been successfully deleted from our system as requested.</p>
      <p>If you did not request this action or have any questions, please contact our support team immediately.</p>
      <p>Thank you for using our service.</p>
    `;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: subject,
      html: content,
    });
    
    console.log(`Confirmation email sent for ${type} deletion to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send confirmation email: ${error.message}`);
  }
};

// Delete all expenses
export const deleteAllExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    
    // Send confirmation email
    const user = await userModel.findById(userId); 

    if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }

    // Delete all expenses for this user
    const result = await ExpenseModel.deleteMany({ userId: userId });

    await sendConfirmationEmail(user, "expenses");
    
    res.status(200).json({
      success: true,
      message: "All expenses have been successfully deleted",
      count: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting expenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expenses",
      error: error.message
    });
  }
};

// Delete all income
export const deleteAllIncome = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    
    // Send confirmation email
    const user = await userModel.findById(userId); 

    if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }

    // Delete all income records for this user
    const result = await IncomeModel.deleteMany({ userId: userId });

    await sendConfirmationEmail(user, "income");
    res.status(200).json({
      success: true,
      message: "All income records have been successfully deleted",
      count: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting income records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete income records",
      error: error.message
    });
  }
};

// Delete all bills
export const deleteAllBills = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    
    // Send confirmation email
    const user = await userModel.findById(userId); 

    if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }

    // Delete all bills for this user
    const result = await BillModel.deleteMany({ userId: userId });

    await sendConfirmationEmail(user, "bills");
    
    res.status(200).json({
      success: true,
      message: "All bills have been successfully deleted",
      count: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting bills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bills",
      error: error.message
    });
  }
};

// Delete all budgets
export const deleteAllBudgets = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    // Send confirmation email
    const user = await userModel.findById(userId); 

    if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }

    // Delete all budgets for this user
    const result = await BudgetModel.deleteMany({ userId: userId });
    user.onboardingData.monthlyBudgets = []; // Clear budgets from onboarding data
    await user.save(); // Save the updated user

    await sendConfirmationEmail(user, "budgets");
    
    res.status(200).json({
      success: true,
      message: "All budgets have been successfully deleted",
      count: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting budgets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete budgets",
      error: error.message
    });
  }
};

// Delete all custom categories
export const deleteAllCategories = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    // Find the user
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }
    // Clear custom categories
    user.onboardingData.customIncomeCategories = [];
    user.onboardingData.customExpenseCategories = [];
    
    // Save the updated user
    await user.save();
    
    // Send confirmation email

    await sendConfirmationEmail(user, "categories");
    
    res.status(200).json({
      success: true,
      message: "All custom categories have been successfully deleted"
    });
  } catch (error) {
    console.error("Error deleting categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete categories",
      error: error.message
    });
  }
};

// Delete all transactions
export const deleteAllTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    // Send confirmation email

    const user = await userModel.findById(userId); 

    if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }

    // Delete all transactions for this user
    const result = await IncomeModel.deleteMany({ userId: userId });
    const result2 = await ExpenseModel.deleteMany({ userId: userId });

    await sendConfirmationEmail(user, "All Transaction");

    const total = result.deletedCount + result2.deletedCount;
    res.status(200).json({
      success: true,
      message: "All transactions have been successfully deleted",
      count: total
    });
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete transactions",
      error: error.message
    });
  }
};

// Delete all devices
export const deleteAllDevices = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    // Find the user
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }
    // Clear device tokens
    user.deviceTokens = [];
    
    // Save the updated user
    await user.save();
    
    // Send confirmation email
    await sendConfirmationEmail(user, "devices");
    
    res.status(200).json({
      success: true,
      message: "All devices have been successfully removed from your account"
    });
  } catch (error) {
    console.error("Error removing devices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove devices",
      error: error.message
    });
  }
};

// Delete account (deactivate for 7 days)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    // Find the user
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }
    
    // Mark user for deletion in 7 days
    user.accountDeletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    user.isDeactivated = true;
    
    // Save the updated user
    await user.save();
    
    // Send confirmation email
    await sendConfirmationEmail(user, "account");
    
    res.status(200).json({
      success: true,
      message: "Your account has been deactivated. It will be permanently deleted in 7 days unless you log in again."
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
      error: error.message
    });
  }
};