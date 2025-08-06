import ExpenseModel from "../models/ExpenseModel.js";
import IncomeModel from "../models/IncomeModel.js";
import BillModel from "../models/BillModel.js";
import BudgetModel from "../models/BudgetModel.js";
import userModel from "../models/model.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import transporter from "../config/mailer.js";

const sendConfirmationEmail = async (user, type) => {
  let subject, content;
  
  if (type === "account") {
    subject = "Account Deactivation Confirmation - Action Required";
    content = `
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Account Deactivation Confirmation</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" type="text/css">
        <style type="text/css">
          body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', Arial, sans-serif;
            background: #F5F7FA;
            color: #333333;
            line-height: 1.6;
          }

          table, td {
            border-collapse: collapse;
          }

          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }

          .container {
            width: 100%;
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          }

          .header {
            padding: 30px 0;
            text-align: center;
            background-color: #FF9800;
            border-radius: 8px 8px 0 0;
            color: white;
          }

          .logo {
            width: 160px;
            height: auto;
          }

          .main-content {
            padding: 40px 50px;
            color: #333333;
          }

          .footer {
            padding: 20px 50px;
            text-align: center;
            color: #9EA3B0;
            font-size: 12px;
            border-top: 1px solid #EEEEEE;
          }

          .button {
            background: #4CAF50;
            text-decoration: none;
            display: inline-block;
            padding: 14px 35px;
            color: #fff;
            font-size: 16px;
            text-align: center;
            font-weight: 500;
            border-radius: 4px;
            transition: background 0.3s;
            margin: 0 10px 10px 0;
          }

          .button:hover {
            background: #45a049;
          }

          .button-secondary {
            background: #FF5252;
            text-decoration: none;
            display: inline-block;
            padding: 14px 35px;
            color: #fff;
            font-size: 16px;
            text-align: center;
            font-weight: 500;
            border-radius: 4px;
            transition: background 0.3s;
            margin: 0 10px 10px 0;
          }

          .button-secondary:hover {
            background: #E53935;
          }

          .greeting {
            font-size: 22px;
            font-weight: 500;
            color: #333333;
            margin-bottom: 20px;
          }

          .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }

          .highlight {
            color: #FF9800;
            font-weight: 500;
          }

          .alert-box {
            background-color: #FFF3E0;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-left: 4px solid #FF9800;
          }

          .countdown-box {
            background-color: #E8F5E8;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
          }

          .verification-badge {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin-left: 5px;
          }

          @media only screen and (max-width: 600px) {
            .container {
              width: 95% !important;
              margin: 20px auto !important;
            }

            .main-content {
              padding: 30px 25px !important;
            }

            .footer {
              padding: 20px 25px !important;
            }
            
            .greeting {
              font-size: 20px !important;
            }
          }
        </style>
      </head>

      <body>
        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F5F7FA">
          <tbody>
            <tr>
              <td valign="top" align="center">
                <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                    <tr>
                      <td class="header">
                        <img src="https://res.cloudinary.com/dio9gtrxc/image/upload/v1744794208/Logo.png" alt="Finvista Logo" class="logo">
                        <h2 style="margin-top: 15px; margin-bottom: 0;">Account Deactivation</h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="main-content">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tbody>
                            <tr>
                              <td class="greeting">
                                Hello ${user?.name},
                              </td>
                            </tr>
                            <tr>
                              <td class="message">
                                Your account has been <span class="highlight">successfully deactivated</span> as requested. We're sorry to see you go, but we understand that sometimes circumstances change.
                              </td>
                            </tr>
                            <tr>
                              <td class="alert-box">
                                <h3 style="margin-top:0; margin-bottom:10px; color:#FF9800;">⏰ Grace Period Active</h3>
                                <h2 style="margin-top:0; margin-bottom:10px; font-size:24px;">7 Days Remaining</h2>
                                <p style="margin:0; font-size:14px;">Your data will be permanently deleted after this period</p>
                              </td>
                            </tr>
                            <tr>
                              <td class="message">
                                <strong>What happens next:</strong><br>
                                • Your account is now deactivated and inaccessible<br>
                                • All your financial data is securely stored for 7 days<br>
                                • After 7 days, all data will be permanently deleted<br>
                                • You can reactivate your account anytime within this period
                              </td>
                            </tr>
                            <tr>
                              <td class="countdown-box">
                                <h3 style="margin-top:0; margin-bottom:10px; color:#4CAF50;">Changed Your Mind?</h3>
                                <p style="margin:0;">Simply log in within the next 7 days and your account will be fully restored with all your data intact.</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 20px 0 30px; text-align: center;">
                                <a href="https://finvista-app.vercel.app/login" class="button">
                                  Reactivate Account
                                </a>
                                <a href="https://finvista-app.vercel.app/contact-us" class="button-secondary">
                                  Contact Support
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td class="message" style="font-size: 14px;">
                                If you need assistance or have any questions about your account deactivation, please don't hesitate to contact our support team at <span class="highlight">finvistafinancemanagementapp@gmail.com</span><img src="https://img.icons8.com/?size=100&id=2sZ0sdlG9kWP&format=png&color=000000" alt="Verified" class="verification-badge">.
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 20px; font-size: 15px;">
                                Thank you for being part of the Finvista community,<br>
                                <span style="font-weight: 500;">The Finvista Team</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="footer">
                        <p>&copy; 2025 Finvista. All rights reserved.</p>
                        <p>Pradhikaran, Pune, IN</p>
                        <p><a href="https://finvista-app.vercel.app/">Visit our website</a> | <a href="https://finvista-app.vercel.app/contact-us">Contact Support</a></p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;
  } else {
    subject = `${type.charAt(0).toUpperCase() + type.slice(1)} Data Deletion Confirmation`;
    content = `
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Data Deletion Confirmation</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" type="text/css">
        <style type="text/css">
          body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', Arial, sans-serif;
            background: #F5F7FA;
            color: #333333;
            line-height: 1.6;
          }

          table, td {
            border-collapse: collapse;
          }

          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }

          .container {
            width: 100%;
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          }

          .header {
            padding: 30px 0;
            text-align: center;
            background-color: #4CAF50;
            border-radius: 8px 8px 0 0;
            color: white;
          }

          .logo {
            width: 160px;
            height: auto;
          }

          .main-content {
            padding: 40px 50px;
            color: #333333;
          }

          .footer {
            padding: 20px 50px;
            text-align: center;
            color: #9EA3B0;
            font-size: 12px;
            border-top: 1px solid #EEEEEE;
          }

          .button {
            background: #4CAF50;
            text-decoration: none;
            display: inline-block;
            padding: 14px 35px;
            color: #fff;
            font-size: 16px;
            text-align: center;
            font-weight: 500;
            border-radius: 4px;
            transition: background 0.3s;
          }

          .button:hover {
            background: #45a049;
          }

          .greeting {
            font-size: 22px;
            font-weight: 500;
            color: #333333;
            margin-bottom: 20px;
          }

          .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }

          .highlight {
            color: #4CAF50;
            font-weight: 500;
          }

          .success-box {
            background-color: #E8F5E8;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
          }

          .verification-badge {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin-left: 5px;
          }

          @media only screen and (max-width: 600px) {
            .container {
              width: 95% !important;
              margin: 20px auto !important;
            }

            .main-content {
              padding: 30px 25px !important;
            }

            .footer {
              padding: 20px 25px !important;
            }
            
            .greeting {
              font-size: 20px !important;
            }
          }
        </style>
      </head>

      <body>
        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F5F7FA">
          <tbody>
            <tr>
              <td valign="top" align="center">
                <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                    <tr>
                      <td class="header">
                        <img src="https://res.cloudinary.com/dio9gtrxc/image/upload/v1744794208/Logo.png" alt="Finvista Logo" class="logo">
                        <h2 style="margin-top: 15px; margin-bottom: 0;">Data Deletion Confirmation</h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="main-content">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tbody>
                            <tr>
                              <td class="greeting">
                                Hello ${user?.name},
                              </td>
                            </tr>
                            <tr>
                              <td class="message">
                                We're writing to confirm that all your <span class="highlight">${type} data</span> has been successfully and permanently deleted from our system as requested.
                              </td>
                            </tr>
                            <tr>
                              <td class="success-box">
                                <h3 style="margin-top:0; margin-bottom:10px; color:#4CAF50;">✅ Deletion Complete</h3>
                                <h2 style="margin-top:0; margin-bottom:10px; font-size:24px;">${type.charAt(0).toUpperCase() + type.slice(1)} Data Removed</h2>
                                <p style="margin:0; font-size:14px;">All related information has been permanently erased</p>
                              </td>
                            </tr>
                            <tr>
                              <td class="message">
                                <strong>What was deleted:</strong><br>
                                • All ${type} records and associated data<br>
                                • Related transaction history<br>
                                • Backup copies from our secure servers<br>
                                • Any cached or temporary data
                              </td>
                            </tr>
                            <tr>
                              <td class="message">
                                <span style="color: #FF5252; font-weight: 500;">Important:</span> This action is irreversible. If you did not request this deletion or believe this was done in error, please contact our support team immediately.
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 20px 0 30px; text-align: center;">
                                <a href="https://finvista-app.vercel.app/contact-us" class="button">
                                  Contact Support
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td class="message" style="font-size: 14px;">
                                If you have any questions or concerns about this data deletion, please contact our support team at <span class="highlight">finvistafinancemanagementapp@gmail.com</span><img src="https://img.icons8.com/?size=100&id=2sZ0sdlG9kWP&format=png&color=000000" alt="Verified" class="verification-badge">.
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 20px; font-size: 15px;">
                                Thank you for using Finvista,<br>
                                <span style="font-weight: 500;">The Finvista Team</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="footer">
                        <p>&copy; 2025 Finvista. All rights reserved.</p>
                        <p>Pradhikaran, Pune, IN</p>
                        <p><a href="https://finvista-app.vercel.app/">Visit our website</a> | <a href="https://finvista-app.vercel.app/contact-us">Contact Support</a></p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
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