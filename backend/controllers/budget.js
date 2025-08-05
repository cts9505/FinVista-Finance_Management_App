import BudgetModel from "../models/BudgetModel.js";
import ExpenseModel from "../models/ExpenseModel.js";
import mongoose from "mongoose";
import userModel from "../models/model.js";
import fs from "fs";
import path from "path";
import os from "os";
import Excel from "exceljs";
import transporter from "../config/mailer.js";
import { MONTHLY_BUDGET_SUMMARY_TEMPLATE, YEAR_END_BUDGET_SUMMARY_TEMPLATE } from "../config/emailTemplates.js";

// Helper function to recalculate 'used' field for all budgets of a user
const recalculateAllBudgets = async (userId) => {
    try {
        // Fetch all budgets for the user
        const budgets = await BudgetModel.find({ userId });

        // Fetch all expenses for the user
        const expenses = await ExpenseModel.find({ userId });

        // Update each budget
        for (const budget of budgets) {
            // Filter expenses that match the budget's category and date range
            const relevantExpenses = expenses.filter((expense) => {
                const expenseDate = new Date(expense.date);
                const budgetStartDate = new Date(budget.startDate);
                const budgetEndDate = new Date(budget.endDate);
                return (
                    (budget.title === "Monthly Budget" || expense.category === budget.category) &&
                    expenseDate >= budgetStartDate &&
                    expenseDate <= budgetEndDate
                );
            });

            // Calculate total used amount
            const used = relevantExpenses.reduce((total, expense) => total + expense.amount, 0);

            // Update the budget's used field
            budget.used = used;
            await budget.save();
        }

        return true;
    } catch (error) {
        console.error("Error recalculating budgets:", error);
        return false;
    }
};

// Add this helper function to backend/controllers/budget.js
// (Keep all existing code, just add this function)

const calculatePeriodDates = (period, year, month, customStart = null) => {
    try {
        let startDate, endDate;
        const targetYear = year || new Date().getFullYear();
        const targetMonth = month !== undefined ? month : new Date().getMonth();
        
        switch (period) {
            case "monthly":
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth + 1, 0);
                break;
                
            case "quarterly":
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth + 3, 0);
                break;
                
            case "biannual":
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth + 6, 0);
                break;
                
            case "annual":
                startDate = new Date(targetYear, 0, 1);
                endDate = new Date(targetYear, 12, 0);
                break;
                
            case "custom":
                if (customStart && !isNaN(new Date(customStart).getTime())) {
                    startDate = new Date(customStart);
                    endDate = new Date(customStart);
                    endDate.setMonth(endDate.getMonth() + 1);
                    endDate.setDate(0);
                } else {
                    startDate = new Date(targetYear, targetMonth, 1);
                    endDate = new Date(targetYear, targetMonth + 1, 0);
                }
                break;
                
            default:
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth + 1, 0);
        }
        
        return { startDate, endDate };
    } catch (error) {
        const now = new Date();
        return {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
    }
};

export const addBudget = async (req, res) => {
    try {
        const { title, amount, category, period, autoRenew, startDate, endDate, year, month } = req.body;
        const userId = req.userId;
        let finalStartDate, finalEndDate;

        if (period !== 'custom') {
            if (typeof year !== 'number' || typeof month !== 'number') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Year and month are required for this budget period." 
                });
            }
            finalStartDate = new Date(Date.UTC(year, month, 1));
            finalEndDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
        } else {
            finalStartDate = new Date(startDate);
            finalEndDate = new Date(endDate);
        }
        
        // Final check to prevent saving an invalid date
        if (isNaN(finalStartDate.getTime()) || isNaN(finalEndDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date provided." });
        }

        const budget = new BudgetModel({
            userId, title, amount: parseInt(amount), category, period, autoRenew,
            startDate: finalStartDate,
            endDate: finalEndDate,
        });

        await budget.save();
        res.status(201).json({ success: true, message: "Budget Created Successfully", budget });
    } catch (error) {
        console.error("Error adding budget:", error);
        // Provide a more specific error message if it's a validation error
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Validation failed.", error: error.message });
        }
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Update updateBudget (only change the date calculation part)
export const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, emoji, amount, category, period, autoRenew, startDate, endDate, year, month } = req.body;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid budget ID" });
        }

        const budget = await BudgetModel.findOne({ _id: id, userId });
        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found or unauthorized" });
        }

        // Prepare updated data with period-based calculation
        const updatedData = {
            title: title || budget.title,
            emoji: emoji || budget.emoji,
            amount: amount !== undefined ? amount : budget.amount,
            category: category || budget.category,
            period: period || budget.period,
            autoRenew: autoRenew !== undefined ? autoRenew : budget.autoRenew,
        };

        // Handle date calculation based on period
        if (period && period !== "custom") {
            const dates = calculatePeriodDates(period, year, month);
            updatedData.startDate = dates.startDate;
            updatedData.endDate = dates.endDate;
        } else {
            updatedData.startDate = startDate ? new Date(startDate) : budget.startDate;
            updatedData.endDate = endDate ? new Date(endDate) : budget.endDate;
            
            // Ensure custom dates are valid
            updatedData.startDate.setHours(0, 0, 0, 0);
            updatedData.endDate.setHours(23, 59, 59, 999);
        }

        // Check if category or date range changed (keep existing logic)
        const categoryChanged = updatedData.category !== budget.category;
        const dateRangeChanged =
            updatedData.startDate.getTime() !== budget.startDate.getTime() ||
            updatedData.endDate.getTime() !== budget.endDate.getTime();

        // Update the budget (keep existing)
        const updatedBudget = await BudgetModel.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedBudget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }

        // Keep existing recalculation logic
        if (categoryChanged || dateRangeChanged) {
            await recalculateAllBudgets(userId);
        } else {
            const expenses = await ExpenseModel.find({
                userId,
                category: updatedData.category,
                date: {
                    $gte: new Date(updatedData.startDate),
                    $lte: new Date(updatedData.endDate),
                },
            });
            const used = expenses.reduce((total, expense) => total + expense.amount, 0);
            updatedBudget.used = used;
            await updatedBudget.save();
        }

        res.status(200).json({
            success: true,
            message: "Budget Updated Successfully",
            updatedBudget,
        });
    } catch (error) {
        console.error("Error updating budget:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getBudgets = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID Required! Please Login" });
        }

        const budgets = await BudgetModel.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, budgets });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid budget ID" });
        }

        const deletedBudget = await BudgetModel.findOneAndDelete({ _id: id, userId });

        if (!deletedBudget) {
            return res.status(404).json({ success: false, message: "Budget Not Found or Unauthorized!" });
        }

        res.status(200).json({ success: true, message: "Budget Deleted Successfully" });
    } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send budget summary route
export const sendSummary = async (req, res) => {
    try {
        const { type, month, year } = req.body;
        const userId = req.userId;

        // ... (validation and user checks remain the same) ...
        if (!type) {
            return res.json({ success: false, message: 'Summary type is required' });
        }
        if (type === 'monthly' && (!month || !year)) {
            return res.json({ success: false, message: 'Month and year are required for monthly summary' });
        }
        if (type === 'yearly' && !year) {
            return res.json({ success: false, message: 'Year is required for yearly summary' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (!user.isPremium) {
            return res.json({ success: false, message: 'This feature is available only for premium users' });
        }

        let budgets, subject, period;
        let startDate, endDate;

        if (type === 'monthly') {
            // FIX: Create dates in UTC to match database
            startDate = new Date(Date.UTC(year, month - 1, 1));
            // Get the last day of the month in UTC
            endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
            
            const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

            budgets = await BudgetModel.find({
                userId: userId,
                startDate: { $gte: startDate },
                endDate: { $lte: endDate }
            });
            
            subject = `Budget Summary for ${monthName} ${year}`;
            period = `${monthName} ${year}`;
        } else { // Yearly summary
            // FIX: Create dates in UTC for yearly query
            startDate = new Date(Date.UTC(year, 0, 1));
            endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

            budgets = await BudgetModel.find({
                userId: userId,
                startDate: { $gte: startDate },
                endDate: { $lte: endDate }
            });

            subject = `Budget Summary for ${year}`;
            period = `${year}`;
        }

        if (budgets.length === 0) {
             return res.json({
                success: false,
                message: `No budgets found for the selected period (${period}).`
            });
        }

        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalUsed = budgets.reduce((sum, budget) => sum + budget.used, 0);
        const remaining = totalBudget - totalUsed;
        
        const budgetRows = budgets.map(budget => {
            return `
                <tr>
                    <td>${budget.title} (${budget.category})</td>
                    <td>₹${budget.amount.toFixed(2)}</td>
                    <td>₹${budget.used.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        const workbook = await createExcelReport(budgets, type, period, totalBudget, totalUsed, remaining);
        
        const excelFileName = `${type}_budget_summary_${Date.now()}.xlsx`;
        const excelFilePath = path.join(os.tmpdir(), excelFileName);
        
        await workbook.xlsx.writeFile(excelFilePath);

        let template;
        let templateData;
        
        if (type === 'monthly') {
            template = MONTHLY_BUDGET_SUMMARY_TEMPLATE;
            templateData = {
                name: user.name,
                month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
                year: year,
                totalBudget: totalBudget.toFixed(2),
                totalUsed: totalUsed.toFixed(2),
                savings: remaining.toFixed(2),
                budgetRows: budgetRows
            };
        } else {
            template = YEAR_END_BUDGET_SUMMARY_TEMPLATE;
            templateData = {
                name: user.name,
                year: year,
                totalBudget: totalBudget.toFixed(2),
                totalUsed: totalUsed.toFixed(2),
                budgetRows: budgetRows
            };
        }

        let htmlContent = template;
        for (const [key, value] of Object.entries(templateData)) {
            htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: subject,
            html: htmlContent,
            attachments: [
                {
                    filename: `${type === 'monthly' ? 'Monthly' : 'Yearly'} Budget Report.xlsx`,
                    path: excelFilePath
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        fs.unlink(excelFilePath, (err) => {
            if (err) console.error('Error deleting temporary Excel file:', err);
        });

        return res.json({
            success: true,
            message: 'Budget summary sent successfully'
        });
    } catch (error) {
        console.error('Send budget summary error:', error);
        return res.json({
            success: false,
            message: 'An error occurred while sending budget summary',
            error: error.message
        });
    }
};
// You will also need to update this helper function
const createExcelReport = async (budgets, type, period, totalBudget, totalUsed, remaining) => {
    // This function needs to be rewritten to only use the budget data,
    // not expense or categoryBreakdown data.
    const workbook = new Excel.Workbook();
    const summarySheet = workbook.addWorksheet('Budget Summary');

    // Add title and headers
    summarySheet.mergeCells('A1:C1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `${type === 'monthly' ? 'Monthly' : 'Yearly'} Budget Summary - ${period}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    summarySheet.addRow(['Budget Title (Category)', 'Budget Amount (₹)', 'Amount Used (₹)']);
    
    // Style header row
    const headerRow = summarySheet.getRow(2);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    // Add budget data rows
    budgets.forEach(budget => {
        summarySheet.addRow([
            `${budget.title} (${budget.category})`,
            budget.amount,
            budget.used
        ]);
    });

    // Add summary row
    summarySheet.addRow([]);
    const summaryRowIndex = budgets.length + 4;
    summarySheet.addRow(['Total', totalBudget, totalUsed]);
    
    const summaryRow = summarySheet.getRow(summaryRowIndex);
    summaryRow.font = { bold: true };
    summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

    // Format currency columns
    for (let i = 3; i <= budgets.length + 2; i++) {
        ['B', 'C'].forEach(col => {
            const cell = summarySheet.getCell(`${col}${i}`);
            cell.numFmt = '₹#,##0.00';
        });
    }
    ['B', 'C'].forEach(col => {
        const cell = summarySheet.getCell(`${col}${summaryRowIndex}`);
        cell.numFmt = '₹#,##0.00';
    });

    // Auto-fit columns
    summarySheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    return workbook;
};