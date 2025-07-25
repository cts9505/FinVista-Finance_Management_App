import express from "express";
import {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyOtp,
    verifyEmailToken,
    sendResetOtp,
    verifyResetToken,
    resetPasswordToken,
    resetPassword,
    isAuthenticated,
    sendMessage,
    checkPremiumStatus,
    updateOnboardingData,
    updateProfile,
    checkPasswordResetCooldown,
    changePassword,
    updateCategoryOrder,
    addCategory,
    editCategory,
    deleteCategory,
    googleAuth,
    updateProfilePic,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import { premiumFeatureAuth,isAdmin, userDataById, getallUsers } from "../middleware/premiumAuth.js";
import { addIncome, getIncomes, deleteIncome, updateIncomeController } from "../controllers/income.js";
import { addExpense, getExpense, deleteExpense, updateExpenseController } from "../controllers/expense.js";
import { updateBudget, addBudget, deleteBudget, getBudgets, sendSummary } from "../controllers/budget.js";
import { addBill, getBill, deleteBill, updateBillController } from "../controllers/billscontroller.js";
import {
    getPaymentHistory,
    createOrder,
    verifyPayment,
    startFreeTrial,
    cancelSubscription,
    handleRazorpayWebhook
} from "../controllers/paymentController.js";
import {
    processOCRImage,
    getPendingTransactions,
    updateTransaction,
    getAllTransactions,
    deleteTransaction,
    deleteAllDuplicates,
} from "../controllers/transaction.js";
import { getUserData, monthlyBudget, updateMonthlyBudget, updateFinancialProfile, syncOnboardingBudget, updateAndSyncOnboardingData } from "../controllers/usercontroller.js";
import { 
    subscribeNewsletter, 
    reportBug, 
    getAllNewsletterSubscribers, 
    getAllBugReports ,
    updateBugReport,
    getUserBugReport,
    checkUserAdmin
  } from "../controllers/supportController.js";
  import { uploadImage } from "../controllers/imageController.js";
  import multer from "multer";

  import { 
    deleteAllExpenses, 
    deleteAllIncome, 
    deleteAllBills, 
    deleteAllBudgets, 
    deleteAllCategories, 
    deleteAllTransactions, 
    deleteAllDevices,
    deleteAccount
  } from "../controllers/deletecontroller.js";

import { upload } from "../middleware/multerMiddleware.js";
import {
    submitContactRequest,
    getAllContactRequests,
    updateContactRequest,
    getContactRequestsByEmail
  } from "../controllers/contactController.js";

  import {
    createReview,
    getPublicReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    getAdminReviews,
    approveReview,
    togglePinReview,
    replyToReview,
    deleteReply,
    getReviewStats
  } from '../controllers/reviewController.js';
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post('/send-verify-otp', userAuth,sendVerifyOtp);
router.post('/verify-otp', userAuth,verifyOtp);
router.get('/verify-email-token/:token', verifyEmailToken);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);
router.post("/reset-password-with-token",resetPasswordToken);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/is-auth", userAuth, isAuthenticated);
router.post("/send-message", sendMessage);
router.get("/google", googleAuth);
router.put("/update-profile", userAuth, updateProfile);
router.post("/add-income", userAuth, addIncome);
router.get("/get-incomes", userAuth, getIncomes);
router.delete("/delete-income/:id", userAuth, deleteIncome);
router.post("/add-expense", userAuth, addExpense);
router.get("/get-expenses", userAuth, getExpense);
router.delete("/delete-expense/:id", userAuth, deleteExpense);
router.put("/update-income/:id", userAuth, updateIncomeController);
router.put("/update-expense/:id", userAuth, updateExpenseController);
router.put("/update-budget/:id", userAuth, updateBudget);
router.get("/get-budgets", userAuth, getBudgets);
router.post("/add-budget", userAuth, addBudget);
router.delete("/delete-budget/:id", userAuth, deleteBudget);
router.post("/add-bill", userAuth, addBill);
router.get("/get-bills", userAuth, getBill);
router.delete("/delete-bill/:id", userAuth, deleteBill);
router.put("/update-bill/:id", userAuth, updateBillController);
router.post("/create-order", userAuth, createOrder);
router.post("/verify-payment", userAuth, verifyPayment);
router.post("/start-free-trial", userAuth, startFreeTrial);
router.get("/get-payment", userAuth, getPaymentHistory);
router.post("/cancel-subscription", userAuth, cancelSubscription);
router.get("/check-premium-status", userAuth, checkPremiumStatus);
router.put("/update-onboarding", userAuth, updateOnboardingData);
router.put("/update-onboarding", userAuth, updateAndSyncOnboardingData);
router.put("/change-password", userAuth, checkPasswordResetCooldown, changePassword);
router.put("/update-category-order", userAuth, updateCategoryOrder);
router.post("/add-category", userAuth, addCategory);
router.delete("/delete-category", userAuth, deleteCategory);
router.put("/edit-category", userAuth, editCategory);
router.put("/update-financial-profile", userAuth, updateFinancialProfile);
router.post("/process-ocr-image", userAuth, processOCRImage);
router.get("/pending-transactions", userAuth, getPendingTransactions);
router.put("/update-transaction/:id", userAuth, updateTransaction);
router.get("/all-transactions", userAuth, getAllTransactions);
router.delete("/delete-transaction/:id", userAuth, deleteTransaction);
router.post("/delete-all-duplicates", userAuth, deleteAllDuplicates);
router.post("/subscribe-newsletter", subscribeNewsletter);
router.get("/newsletter-subscribers", userAuth, getAllNewsletterSubscribers);
router.post("/report-bug", userAuth, upload.single('screenshot'), uploadImage, reportBug);
router.get("/bug-reports", userAuth,getAllBugReports);
router.get("/user-report-bug", userAuth, getUserBugReport);
router.patch('/update-bug-report/:id', userAuth, updateBugReport);
router.get('/check-admin',userAuth,checkUserAdmin);
router.delete("/delete-all-expenses", userAuth, deleteAllExpenses);
router.delete("/delete-all-income", userAuth, deleteAllIncome);
router.delete("/delete-all-bills", userAuth, deleteAllBills);
router.delete("/delete-all-budgets", userAuth, deleteAllBudgets);
router.delete("/delete-all-categories", userAuth, deleteAllCategories);
router.delete("/delete-all-transactions", userAuth, deleteAllTransactions);
router.delete("/delete-all-devices", userAuth, deleteAllDevices);
router.delete("/delete-account", userAuth, deleteAccount);
router.post("/submit",upload.single("image"),uploadImage,submitContactRequest);
router.get("/track", getContactRequestsByEmail);
router.get("/admin/all", userAuth, getAllContactRequests);
router.put("/admin/:id", userAuth, updateContactRequest);
router.get('/public', getPublicReviews);
router.post('/create', userAuth, createReview);
router.get('/user', userAuth, getUserReviews);
router.put('/update/:id', userAuth, updateReview);
router.delete('/delete/:id', userAuth, deleteReview);
router.get('/admin', userAuth, isAdmin, getAdminReviews);
router.put('/admin/approve/:id', userAuth, isAdmin, approveReview);
router.put('/admin/pin/:id', userAuth, isAdmin, togglePinReview);
router.post('/admin/reply/:id', userAuth, isAdmin, replyToReview);
router.delete('/admin/reply/:id', userAuth, isAdmin, deleteReply);
router.get('/admin/stats', userAuth, isAdmin, getReviewStats);
router.get('/user/:id', userAuth, userDataById);
router.post('/users/batch',getallUsers);
router.post("/sync-onboarding-budget", userAuth, syncOnboardingBudget);
router.post('/send-budget-summary',userAuth,sendSummary);
// router.post('/webhook/razorpay', handleRazorpayWebhook);
router.post("/update-profile-pic", userAuth, upload.single('profilePic'), uploadImage, updateProfilePic);
export default router;
