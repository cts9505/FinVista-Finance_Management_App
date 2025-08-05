import userModel from "../models/model.js";
import BudgetModel from "../models/BudgetModel.js";
import ExpenseModel from "../models/ExpenseModel.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: 'User not found!' });

    const onboardingData = user.onboardingData || {};

    let hasPassword=false;
    if(user.password) hasPassword=true;

    return res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        address: user.address,
        hasPassword:hasPassword,
        phone: user.phone,
        age: user.age,
        image: user.image,
        loginStreak: user.loginStreak,
        isAdmin: user.isAdmin,
        isAccountVerified: user.isAccountVerified,
        isPremium: user.isPremium,
        isOnboardingComplete: user.isOnboardingComplete,
        lastPasswordChange: user.lastPasswordChange,
        isDeactivated: user.isDeactivated,
        accountDeletionDate: user.accountDeletionDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        subscriptionType: user.subscriptionType,
        trialEndDate: user.trialEndDate,
        subscriptionEndDate: user.subscriptionEndDate,
        lastLogin: user.lastLogin,
        loginHistory: (user.loginHistory || []).map(login => ({
          isSuccessful: login.isSuccessful,
          loginAt: login.loginAt,
          device: login.device,
          browser: login.browser,
          ipAddress: login.ipAddress,
          loginMethod: login.loginMethod,
          operatingSystem: login.operatingSystem,
          location: login.location ? {
            country: login.location.country,
            city: login.location.city,
            region: login.location.region
          } : null
        })),
        deviceTokens: (user.deviceTokens || []).map(device => ({
          device: device.device,
          lastUsed: device.lastUsed
        })),
        isOnboardingComplete: user.isOnboardingComplete,
        onboardingData: {
          employmentStatus: onboardingData.employmentStatus || null,
          yearlyIncome: onboardingData.yearlyIncome || 0,
          customIncomeCategories: (onboardingData.customIncomeCategories || []).map(cat => ({
            _id: cat._id.toString(),
            name: cat.name
          })),
          customExpenseCategories: (onboardingData.customExpenseCategories || []).map(cat => ({
            _id: cat._id.toString(),
            name: cat.name
          })),
          monthlyBudgets: onboardingData.monthlyBudgets || [],
          financialGoals: onboardingData.financialGoals || [],
          financialHabits: onboardingData.financialHabits || [],
          isCurrentlyInvesting: onboardingData.isCurrentlyInvesting || false,
          investmentTypes: onboardingData.investmentTypes || [],
          wantsInvestmentRecommendations: onboardingData.wantsInvestmentRecommendations || false,
          savingsGoal: user.savingsGoal || onboardingData.savingsGoal || 0,
          riskLevel: onboardingData.riskLevel || "Moderate"
        },
        __v: user.__v
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const monthlyBudget = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.json({
            success: true,
            monthlyBudgets: user.onboardingData.monthlyBudgets || []
        });
    } catch (error) {
        console.error('Error fetching monthly budget:', error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateMonthlyBudget = async (req, res) => {
    try {
        const { month, year, amount } = req.body;

        if (!month || !year || !amount || isNaN(parseFloat(amount))) {
            return res.status(400).json({ success: false, message: "Invalid budget data" });
        }

        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update UserModel
        if (!user.onboardingData.monthlyBudgets) {
            user.onboardingData.monthlyBudgets = [];
        }

        const existingBudgetIndex = user.onboardingData.monthlyBudgets.findIndex(
            (budget) => budget.month === month && budget.year === year
        );

        if (existingBudgetIndex !== -1) {
            user.onboardingData.monthlyBudgets[existingBudgetIndex].amount = parseFloat(amount);
        } else {
            user.onboardingData.monthlyBudgets.push({
                month,
                year,
                amount: parseFloat(amount),
                createdAt: new Date(),
            });
        }

        // Calculate correct dates
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        // Check for existing budget in BudgetModel
        const monthlyIncomeBudget = await BudgetModel.findOne({
            userId: req.userId,
            title: "Monthly Budget",
            startDate: startDate,
            endDate: endDate,
        });

        // Calculate expenses
        const expenses = await ExpenseModel.find({
            userId: req.userId,
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        });
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        if (monthlyIncomeBudget) {
            // Update existing budget
            monthlyIncomeBudget.amount = parseFloat(amount);
            monthlyIncomeBudget.used = totalExpenses;
            monthlyIncomeBudget.autoRenew = false; // Ensure correct setting
            await monthlyIncomeBudget.save();
        } else {
            // Create new budget
            await BudgetModel.create({
                userId: req.userId,
                title: "Monthly Budget",
                amount: parseFloat(amount),
                used: totalExpenses,
                category: "Income",
                emoji: "💰",
                period: "monthly",
                autoRenew: false,
                startDate,
                endDate,
            });
        }

        await user.save();
        return res.json({
            success: true,
            message: "Monthly budget updated successfully",
        });
    } catch (error) {
        console.error("Error updating monthly budget:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateFinancialProfile = async (req, res) => {
    try {
        const { onboardingData } = req.body;

        if (!onboardingData) {
            return res.status(400).json({ success: false, message: "Onboarding data is required" });
        }

        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update onboardingData
        user.onboardingData = {
            ...user.onboardingData,
            employmentStatus: onboardingData.employmentStatus || user.onboardingData.employmentStatus,
            yearlyIncome: onboardingData.yearlyIncome ?? user.onboardingData.yearlyIncome,
            savingsGoal: onboardingData.savingsGoal ?? user.onboardingData.savingsGoal,
            riskLevel: onboardingData.riskLevel || user.onboardingData.riskLevel,
            monthlyBudgets: onboardingData.monthlyBudgets || user.onboardingData.monthlyBudgets,
            financialGoals: onboardingData.financialGoals || user.onboardingData.financialGoals,
            financialHabits: onboardingData.financialHabits || user.onboardingData.financialHabits,
            isCurrentlyInvesting: onboardingData.isCurrentlyInvesting ?? user.onboardingData.isCurrentlyInvesting,
            investmentTypes: onboardingData.investmentTypes || user.onboardingData.investmentTypes,
        };

        // Update Monthly Budgets in BudgetModel
        if (onboardingData.monthlyBudgets && Array.isArray(onboardingData.monthlyBudgets)) {
            for (const budget of onboardingData.monthlyBudgets) {
                const { month, year, amount } = budget;
                if (month && year && amount !== undefined) {
                    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
                    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

                    const monthlyIncomeBudget = await BudgetModel.findOne({
                        userId: req.userId,
                        title: "Monthly Budget",
                        startDate: startDate,
                        endDate: endDate,
                    });

                    const expenses = await ExpenseModel.find({
                        userId: req.userId,
                        date: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    });
                    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

                    if (monthlyIncomeBudget) {
                        monthlyIncomeBudget.amount = parseFloat(amount);
                        monthlyIncomeBudget.used = totalExpenses;
                        monthlyIncomeBudget.autoRenew = false;
                        await monthlyIncomeBudget.save();
                    } else {
                        await BudgetModel.create({
                            userId: req.userId,
                            title: "Monthly Budget",
                            amount: parseFloat(amount),
                            used: totalExpenses,
                            category: "Income",
                            emoji: "💰",
                            period: "monthly",
                            autoRenew: false,
                            startDate,
                            endDate,
                        });
                    }
                }
            }
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Financial profile updated successfully",
        });
    } catch (error) {
        console.error("Error updating financial profile:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const syncOnboardingBudget = async (req, res) => {
    try {
        const { year, month, amount } = req.body; // month is 0-11
        const userId = req.userId;

        if (typeof year !== 'number' || typeof month !== 'number' || typeof amount !== 'number') {
            return res.status(400).json({ success: false, message: "Year, month, and amount are required." });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // JS month is 0-11, but we store it as 1-12 in the schema.
        const monthToStore = month + 1;

        // Find the index of the budget for the given month and year
        const budgetIndex = user.onboardingData.monthlyBudgets.findIndex(
            b => b.month === monthToStore && b.year === year
        );

        if (budgetIndex > -1) {
            // If it exists, update it
            user.onboardingData.monthlyBudgets[budgetIndex].amount = amount;
        } else {
            // If it doesn't exist, add it to the array
            user.onboardingData.monthlyBudgets.push({ year, month: monthToStore, amount });
        }

        await user.save();
        res.status(200).json({ success: true, message: "Onboarding budget synchronized successfully." });

    } catch (error) {
        console.error("Error synchronizing onboarding budget:", error);
        res.status(500).json({ success: false, message: "Server error during sync." });
    }
};

export const updateAndSyncOnboardingData = async (req, res) => {
    try {
        const userId = req.userId;
        const { onboardingData } = req.body; // The frontend sends the updated data

        if (!onboardingData) {
            return res.status(400).json({ success: false, message: "Onboarding data is required." });
        }

        // Step 1: Update the user's profile in the UserModel
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $set: { onboardingData: onboardingData, isOnboardingComplete: true } },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // --- Synchronization Logic ---
        // Step 2: Sync changes in onboardingData.monthlyBudgets to the main Budget collection
        if (onboardingData.monthlyBudgets && onboardingData.monthlyBudgets.length > 0) {
            
            for (const obBudget of onboardingData.monthlyBudgets) {
                const { year, month, amount } = obBudget; // month is 1-12 as per your schema

                // Find a "Monthly Budget" document in the main collection for this user, year, and month
                const correspondingBudget = await BudgetModel.findOne({
                    userId,
                    title: "Monthly Budget",
                    $expr: { // Use $expr to compare parts of the date field
                        $and: [
                            { $eq: [{ $year: "$startDate" }, year] },
                            { $eq: [{ $month: "$startDate" }, month] } // Mongoose's $month is 1-12
                        ]
                    }
                });

                if (correspondingBudget) {
                    // If a budget exists and the amount has changed, update it
                    if (correspondingBudget.amount !== amount) {
                        correspondingBudget.amount = amount;
                        await correspondingBudget.save();
                    }
                } else {
                    // If NO budget exists for that month, CREATE one to keep data in sync
                    const startDate = new Date(Date.UTC(year, month - 1, 1)); // JS month is 0-11
                    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

                    const newBudget = new BudgetModel({
                        userId,
                        title: "Monthly Budget",
                        amount,
                        category: "Income",
                        emoji: "💰",
                        period: "monthly",
                        autoRenew: false,
                        startDate,
                        endDate,
                    });
                    await newBudget.save();
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Profile updated and budgets synchronized successfully!",
            userData: user // Send back the updated user data
        });

    } catch (error) {
        console.error("Error updating onboarding data:", error);
        res.status(500).json({ success: false, message: "Server error during profile update." });
    }
};