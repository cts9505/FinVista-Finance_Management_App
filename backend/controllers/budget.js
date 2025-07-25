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

        // Validation checks
        if (!type) {
            return res.json({
                success: false,
                message: 'Summary type is required'
            });
        }

        if (type === 'monthly' && (!month || !year)) {
            return res.json({
                success: false,
                message: 'Month and year are required for monthly summary'
            });
        }

        if (type === 'yearly' && !year) {
            return res.json({
                success: false,
                message: 'Year is required for yearly summary'
            });
        }

        // Find the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is premium
        if (!user.isPremium) {
            return res.json({
                success: false,
                message: 'This feature is available only for premium users'
            });
        }

        let budgets, expenses, subject, period;
        let startDate, endDate;

        // Fetch budgets and expenses based on summary type
        if (type === 'monthly') {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
            
            const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

            budgets = await BudgetModel.find({
                user: userId,
                startDate: { $gte: startDate },
                endDate: { $lte: endDate }
            });

            expenses = await ExpenseModel.find({
                user: userId,
                date: { $gte: startDate, $lte: endDate }
            });

            subject = `Budget Summary for ${monthName} ${year}`;
            period = `${monthName} ${year}`;
        } else {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);

            budgets = await BudgetModel.find({
                user: userId,
                startDate: { $gte: startDate },
                endDate: { $lte: endDate }
            });

            expenses = await ExpenseModel.find({
                user: userId,
                date: { $gte: startDate, $lte: endDate }
            });

            subject = `Budget Summary for ${year}`;
            period = `${year}`;
        }

        // Calculate summary
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = totalBudget - totalSpent;

        // Generate category-wise breakdown
        const categoryBreakdown = budgets.map(budget => {
            const categoryExpenses = expenses
                .filter(e => e.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, e) => sum + e.amount, 0);
            return {
                title: budget.title,
                category: budget.category,
                budget: budget.amount,
                spent: categoryExpenses,
                remaining: budget.amount - categoryExpenses
            };
        });

        // Generate budget rows for email template
        const budgetRows = categoryBreakdown.map(item => `
            <tr>
                <td>${item.title} (${item.category})</td>
                <td>₹${item.budget.toFixed(2)}</td>
                <td>₹${item.spent.toFixed(2)}</td>
            </tr>
        `).join('');

        // Create Excel file for attachment
        const workbook = await createExcelReport(categoryBreakdown, type, period, totalBudget, totalSpent, remaining);
        
        // Save the Excel file temporarily
        const excelFileName = `${type}_budget_summary_${Date.now()}.xlsx`;
        const excelFilePath = path.join(os.tmpdir(), excelFileName);
        
        await workbook.xlsx.writeFile(excelFilePath);

        // Select the correct template based on summary type
        let template;
        let templateData;
        
        if (type === 'monthly') {
            template = MONTHLY_BUDGET_SUMMARY_TEMPLATE;
            templateData = {
                name: user.name,
                month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
                year: year,
                totalBudget: totalBudget.toFixed(2),
                totalUsed: totalSpent.toFixed(2),
                savings: remaining.toFixed(2),
                budgetRows: budgetRows
            };
        } else {
            template = YEAR_END_BUDGET_SUMMARY_TEMPLATE;
            templateData = {
                name: user.name,
                year: year,
                totalBudget: totalBudget.toFixed(2),
                totalUsed: totalSpent.toFixed(2),
                budgetRows: budgetRows
            };
        }

        // Replace all placeholders in the template
        let htmlContent = template;
        for (const [key, value] of Object.entries(templateData)) {
            htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        // Prepare email with attachment
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

        // Send email
        await transporter.sendMail(mailOptions);

        // Delete the temporary file
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

// Function to create Excel report - simplified version without charts
const createExcelReport = async (categoryBreakdown, type, period, totalBudget, totalSpent, remaining) => {
    // Create a new Excel workbook
    const workbook = new Excel.Workbook();
    
    // Add main summary worksheet
    const summarySheet = workbook.addWorksheet('Budget Summary');

    // Add title row
    summarySheet.mergeCells('A1:E1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `${type === 'monthly' ? 'Monthly' : 'Yearly'} Budget Summary - ${period}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add headers
    summarySheet.addRow(['Category', 'Budget Title', 'Budget Amount (₹)', 'Spent Amount (₹)', 'Remaining (₹)']);
    
    // Style the header row
    const headerRow = summarySheet.getRow(2);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
    };

    // Add data rows
    categoryBreakdown.forEach(item => {
        summarySheet.addRow([
            item.category,
            item.title,
            item.budget,
            item.spent,
            item.remaining
        ]);
    });

    // Add summary row
    summarySheet.addRow([]);
    const summaryRowIndex = categoryBreakdown.length + 4;
    summarySheet.addRow(['Total', '', totalBudget, totalSpent, remaining]);
    
    // Style the summary row
    const summaryRow = summarySheet.getRow(summaryRowIndex);
    summaryRow.font = { bold: true };
    summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
    };

    // Format currency columns
    for (let i = 3; i <= categoryBreakdown.length + 2; i++) {
        ['C', 'D', 'E'].forEach(col => {
            const cell = summarySheet.getCell(`${col}${i}`);
            cell.numFmt = '₹#,##0.00';
        });
    }
    
    // Format total row
    ['C', 'D', 'E'].forEach(col => {
        const cell = summarySheet.getCell(`${col}${summaryRowIndex}`);
        cell.numFmt = '₹#,##0.00';
    });

    // Add category breakdown sheet
    const categorySheet = workbook.addWorksheet('Category Analysis');
    
    // Add title to category sheet
    categorySheet.mergeCells('A1:C1');
    const catTitleCell = categorySheet.getCell('A1');
    catTitleCell.value = 'Budget Allocation by Category';
    catTitleCell.font = { size: 16, bold: true };
    catTitleCell.alignment = { horizontal: 'center' };
    
    // Add headers for category sheet
    categorySheet.addRow(['Category', 'Total Budget (₹)', 'Percentage']);
    
    // Style header row
    const catHeaderRow = categorySheet.getRow(2);
    catHeaderRow.font = { bold: true };
    catHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
    };
    
    // Create category totals
    const categoryTotals = {};
    categoryBreakdown.forEach(item => {
        if (!categoryTotals[item.category]) {
            categoryTotals[item.category] = 0;
        }
        categoryTotals[item.category] += item.budget;
    });
    
    // Add category data rows
    Object.entries(categoryTotals).forEach(([category, budget]) => {
        const percentage = (budget / totalBudget) * 100;
        categorySheet.addRow([
            category,
            budget,
            `${percentage.toFixed(2)}%`
        ]);
    });
    
    // Format budget column
    for (let i = 3; i < 3 + Object.keys(categoryTotals).length; i++) {
        const cell = categorySheet.getCell(`B${i}`);
        cell.numFmt = '₹#,##0.00';
    }
    
    // Add budget vs spent sheet
    const comparisonSheet = workbook.addWorksheet('Budget vs Actual');
    
    // Add title to comparison sheet
    comparisonSheet.mergeCells('A1:C1');
    const compTitleCell = comparisonSheet.getCell('A1');
    compTitleCell.value = 'Budget vs Actual Spending by Category';
    compTitleCell.font = { size: 16, bold: true };
    compTitleCell.alignment = { horizontal: 'center' };
    
    // Add headers for comparison sheet
    comparisonSheet.addRow(['Category', 'Budget (₹)', 'Actual Spent (₹)', 'Difference (₹)', 'Utilization (%)']);
    
    // Style header row
    const compHeaderRow = comparisonSheet.getRow(2);
    compHeaderRow.font = { bold: true };
    compHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
    };
    
    // Prepare category comparison data
    const categoryComparison = {};
    
    // Add budget amounts
    categoryBreakdown.forEach(item => {
        if (!categoryComparison[item.category]) {
            categoryComparison[item.category] = {
                budget: 0,
                spent: 0
            };
        }
        categoryComparison[item.category].budget += item.budget;
        categoryComparison[item.category].spent += item.spent;
    });
    
    // Add comparison data rows
    Object.entries(categoryComparison).forEach(([category, data]) => {
        const difference = data.budget - data.spent;
        const utilization = data.budget > 0 ? (data.spent / data.budget) * 100 : 0;
        
        comparisonSheet.addRow([
            category,
            data.budget,
            data.spent,
            difference,
            `${utilization.toFixed(2)}%`
        ]);
    });
    
    // Format currency columns
    for (let i = 3; i < 3 + Object.keys(categoryComparison).length; i++) {
        ['B', 'C', 'D'].forEach(col => {
            const cell = comparisonSheet.getCell(`${col}${i}`);
            cell.numFmt = '₹#,##0.00';
        });
        
        // Color code differences
        const differenceCell = comparisonSheet.getCell(`D${i}`);
        const utilizationCell = comparisonSheet.getCell(`E${i}`);
        
        if (differenceCell.value < 0) {
            // Over budget
            differenceCell.font = { color: { argb: 'FFFF0000' } }; // Red
            utilizationCell.font = { color: { argb: 'FFFF0000' } }; // Red
        }
    }
    
    // Add transaction detail sheet if there are expenses
    if (categoryBreakdown.some(item => item.spent > 0)) {
        const detailSheet = workbook.addWorksheet('Transaction Details');
        
        // Add title
        detailSheet.mergeCells('A1:E1');
        const detailTitleCell = detailSheet.getCell('A1');
        detailTitleCell.value = `Detailed Transactions - ${period}`;
        detailTitleCell.font = { size: 16, bold: true };
        detailTitleCell.alignment = { horizontal: 'center' };
        
        // Add headers for detail sheet
        detailSheet.addRow(['Category', 'Budget', 'Date', 'Amount (₹)', 'Status']);
        
        // Style header row
        const detailHeaderRow = detailSheet.getRow(2);
        detailHeaderRow.font = { bold: true };
        detailHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2E8F0' }
        };
        
        // Add placeholder for transaction details
        // This would normally pull from actual transaction data
        categoryBreakdown.forEach(item => {
            if (item.spent > 0) {
                detailSheet.addRow([
                    item.category,
                    item.title,
                    new Date().toLocaleDateString(),
                    item.spent,
                    'Completed'
                ]);
            }
        });
        
        // Format currency column
        for (let i = 3; i < 3 + categoryBreakdown.length; i++) {
            const cell = detailSheet.getCell(`D${i}`);
            if (cell.value) {
                cell.numFmt = '₹#,##0.00';
            }
        }
    }

    // Auto-fit columns for all sheets
    workbook.eachSheet(sheet => {
        sheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: false }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });
    });

    return workbook;
};