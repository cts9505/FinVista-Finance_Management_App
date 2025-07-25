import ExpenseModel from "../models/ExpenseModel.js";
import BudgetModel from "../models/BudgetModel.js";
import mongoose from "mongoose";

// Helper function to recalculate 'used' field for all relevant budgets after an expense change
const recalculateBudgetsForExpense = async (userId, expenseCategory, expenseDate) => {
    try {
        // Convert expense date to Date object
        const expenseDateObj = new Date(expenseDate);

        // Find all relevant budgets that:
        // 1. Belong to this user
        // 2. Include the expense's date within their date range
        // 3. Either match the specific category OR are Monthly budgets
        const relevantBudgets = await BudgetModel.find({
            userId,
            $and: [
                { startDate: { $lte: expenseDateObj } },
                { endDate: { $gte: expenseDateObj } },
            ],
            $or: [
                { category: expenseCategory },
                { title: "Monthly Budget" },
            ],
        });

        // Fetch all expenses for the user to recalculate 'used' fields
        const expenses = await ExpenseModel.find({
            userId,
            date: {
                $gte: new Date(Math.min(...relevantBudgets.map(b => new Date(b.startDate)))),
                $lte: new Date(Math.max(...relevantBudgets.map(b => new Date(b.endDate)))),
            },
        });

        // Update each relevant budget
        for (const budget of relevantBudgets) {
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
        console.error("Error recalculating budgets for expense:", error);
        return false;
    }
};

// Add Expense
export const addExpense = async (req, res) => {
    try {
        const { title, emoji, amount, category, description, date } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID Required! Please Login" });
        }

        // Validations
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required!" });
        }
        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required!" });
        }
        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required!" });
        }
        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ success: false, message: "Enter a valid amount!" });
        }

        // Create and save the expense
        const expense = new ExpenseModel({
            userId,
            title,
            emoji,
            amount,
            category,
            description,
            date,
        });

        await expense.save();

        // Recalculate budgets for the new expense
        const success = await recalculateBudgetsForExpense(userId, category, date);
        if (!success) {
            console.warn("Budget recalculation failed after adding expense");
        }

        res.status(201).json({ success: true, message: "Expense Added Successfully" });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Expenses for Logged-in User
export const getExpense = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID Required! Please Login" });
        }

        const expenses = await ExpenseModel.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, expenses });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Expense by ID
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Find the expense before deleting it
        const expenseToDelete = await ExpenseModel.findOne({ _id: id, userId });

        if (!expenseToDelete) {
            return res.status(404).json({ success: false, message: "Expense Not Found or Unauthorized!" });
        }

        // Delete the expense
        await ExpenseModel.findByIdAndDelete(id);

        // Recalculate budgets after deleting the expense
        const success = await recalculateBudgetsForExpense(userId, expenseToDelete.category, expenseToDelete.date);
        if (!success) {
            console.warn("Budget recalculation failed after deleting expense");
        }

        res.status(200).json({ success: true, message: "Expense Deleted Successfully" });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Expense by ID
export const updateExpenseController = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const userId = req.userId;

        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid expense ID" });
        }

        // Get the original expense before updating
        const originalExpense = await ExpenseModel.findOne({ _id: id, userId });

        if (!originalExpense) {
            return res.status(404).json({ success: false, message: "Expense not found or unauthorized" });
        }

        // Update the expense
        const updatedExpense = await ExpenseModel.findByIdAndUpdate(id, updatedData, { new: true });

        // Recalculate budgets based on the updated expense
        const success = await recalculateBudgetsForExpense(
            userId,
            updatedData.category || originalExpense.category,
            updatedData.date || originalExpense.date
        );
        if (!success) {
            console.warn("Budget recalculation failed after updating expense");
        }

        res.status(200).json({
            success: true,
            message: "Expense Updated Successfully",
            updatedExpense,
        });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Export the recalculate function for potential use in other controllers
export { recalculateBudgetsForExpense };