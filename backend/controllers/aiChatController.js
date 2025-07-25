import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import userModel from "../models/model.js";
import incomeModel from "../models/IncomeModel.js";
import expenseModel from "../models/ExpenseModel.js";
import budgetModel from "../models/BudgetModel.js";
import billModel from "../models/BillModel.js";
import dotenv from "dotenv";
import { projectFutureWealth, analyzeSavingsOpportunities, generateInvestmentRecommendations } from "../utils/financialUtils.js";
import ChatModel from "../models/ChatModel.js";

dotenv.config();

// Format number in Indian Rupee format
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Get comprehensive financial data for a user
const getFinancialData = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const incomes = await incomeModel.find({ userId }).sort({ date: -1 });
    const expenses = await expenseModel.find({ userId }).sort({ date: -1 });
    const budgets = await budgetModel.find({ userId });
    const bills = await billModel.find({ userId });

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const lastSixMonths = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();

      const monthStart = new Date(year, date.getMonth(), 1);
      const monthEnd = new Date(year, date.getMonth() + 1, 0);

      const monthlyIncome = incomes
        .filter((income) => {
          const incomeDate = new Date(income.date);
          return incomeDate >= monthStart && incomeDate <= monthEnd;
        })
        .reduce((sum, income) => sum + income.amount, 0);

      const monthlyExpense = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      lastSixMonths.unshift({
        month: `${month} ${year}`,
        income: monthlyIncome,
        expense: monthlyExpense,
        savings: monthlyIncome - monthlyExpense,
      });
    }

    const expenseCategories = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {});

    const sortedExpenseCategories = Object.entries(expenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const budgetUtilization = budgets.map((budget) => {
      const category = budget.category;
      const spent = expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        category,
        title: budget.title,
        budgeted: budget.amount,
        spent,
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
        percentage: percentage.toFixed(2),
      };
    });

    const activeBudgets = budgetUtilization.filter((budget) => {
      const now = new Date();
      return budget.startDate <= now && budget.endDate >= now;
    });

    const futureWealth = projectFutureWealth({
      metrics: {
        totalIncome,
        totalExpenses,
        totalBalance,
      },
    });

    const savingsOpportunities = analyzeSavingsOpportunities(expenses);

    const investmentRecommendations = generateInvestmentRecommendations(user, {
      totalBalance,
      totalExpenses,
      savingsRate: parseFloat(savingsRate),
    });

    return {
      profile: user,
      metrics: {
        totalIncome,
        totalExpenses,
        totalBalance,
        savingsRate: savingsRate.toFixed(2),
      },
      monthlySummary: lastSixMonths,
      expenseBreakdown: sortedExpenseCategories,
      budgetUtilization: activeBudgets,
      incomes,
      expenses,
      budgets,
      bills,
      analysis: {
        futureWealth,
        savingsOpportunities,
        investmentRecommendations,
      },
    };
  } catch (error) {
    console.error("Error getting financial data:", error);
    throw error;
  }
};

// Chat with AI
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check subscription status and chat limits
    const now = new Date();
    if (user.isPremium && user.subscriptionEndDate && user.subscriptionEndDate < now) {
      user.isPremium = false;
      user.subscriptionType = "none";
      user.subscriptionEndDate = now;
      await user.save();
    }

    if (!user.isPremium) {
      const todayChatsCount = await ChatModel.getTodayChatsCount(userId);
      const dailyLimit = user.isTrial ? 3 : 2;

      if (todayChatsCount >= dailyLimit) {
        return res.status(403).json({
          success: false,
          message: "You've reached your daily chat limit",
        });
      }
    }

    const financialData = await getFinancialData(userId);

    const systemPrompt = `
      You are a personal financial assistant for a user in India, using Indian Rupees (INR). Provide concise, actionable advice based on the following data:

      USER PROFILE:
      Name: ${financialData.profile.name}
      Employment Status: ${financialData.profile.onboardingData?.employmentStatus || "Not specified"}
      Yearly Income: ${formatINR(financialData.profile.onboardingData?.yearlyIncome || 0)}
      Risk Level: ${financialData.profile.onboardingData?.riskLevel || "Moderate"}

      FINANCIAL METRICS:
      Total Income: ${formatINR(financialData.metrics.totalIncome)}
      Total Expenses: ${formatINR(financialData.metrics.totalExpenses)}
      Current Balance: ${formatINR(financialData.metrics.totalBalance)}
      Savings Rate: ${financialData.metrics.savingsRate}%

      MONTHLY SUMMARY (Last 6 months):
      ${financialData.monthlySummary
        .map(
          (month) =>
            `- ${month.month}: Income ${formatINR(month.income)}, Expenses ${formatINR(month.expense)}, Savings ${formatINR(month.savings)}`
        )
        .join("\n")}

      TOP EXPENSE CATEGORIES:
      ${financialData.expenseBreakdown
        .slice(0, 5)
        .map((category) => `- ${category.category}: ${formatINR(category.amount)}`)
        .join("\n")}

      ACTIVE BUDGETS:
      ${financialData.budgetUtilization
        .map(
          (budget) =>
            `- ${budget.title} (${budget.category}, ${budget.period}): ${formatINR(budget.spent)} spent of ${formatINR(budget.budgeted)} (${
              budget.percentage
            }%)`
        )
        .join("\n")}

      RECENT INCOME SOURCES:
      ${financialData.incomes
        .slice(0, 5)
        .map(
          (income) =>
            `- ${income.title || income.category}: ${formatINR(income.amount)} (${new Date(income.date).toLocaleDateString("en-IN")})`
        )
        .join("\n")}

      RECENT EXPENSES:
      ${financialData.expenses
        .slice(0, 5)
        .map(
          (expense) =>
            `- ${expense.title || expense.category}: ${formatINR(expense.amount)} (${new Date(expense.date).toLocaleDateString("en-IN")})`
        )
        .join("\n")}

      UPCOMING BILLS:
      ${financialData.bills
        .filter((bill) => new Date(bill.dueDate) > new Date())
        .slice(0, 5)
        .map(
          (bill) =>
            `- ${bill.title}: ${formatINR(bill.amount)} (Due: ${new Date(bill.dueDate).toLocaleDateString("en-IN")})`
        )
        .join("\n")}

      FINANCIAL PROJECTIONS:
      - Projected wealth in 5 years: ${formatINR(financialData.analysis.futureWealth.projectedWealth)}
      - Annual savings: ${formatINR(financialData.analysis.futureWealth.assumptions.annualSavings)}
      - Total potential monthly savings: ${formatINR(financialData.analysis.savingsOpportunities.totalPotentialSavings)}

      INVESTMENT RECOMMENDATIONS:
      - Risk profile: ${financialData.analysis.investmentRecommendations.riskProfile}
      - Emergency fund recommendation: ${formatINR(financialData.analysis.investmentRecommendations.recommendedEmergencyFund)}
      - Investable amount: ${formatINR(financialData.analysis.investmentRecommendations.investableAmount)}
      - Allocation: ${Object.entries(financialData.analysis.investmentRecommendations.recommendedAllocation)
        .filter(([key]) => key !== "description")
        .map(([key, value]) => `${key}: ${value}%`)
        .join(", ")}

      FINANCIAL GOALS:
      ${financialData.profile.onboardingData?.financialGoals?.map((goal) => `- ${goal}`).join("\n") || "No goals specified"}

      Provide personalized financial advice in INR, referencing specific data. Use Indian number formatting (e.g., ₹12,34,567.89). For investments, suggest options common in India (e.g., mutual funds, PPF, NPS) based on the user's risk level. For taxes or complex matters, suggest consulting a professional. Keep responses concise but thorough, addressing the user's question directly.
    `;

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "gemini-1.5-flash",
      maxOutputTokens: 2048,
      temperature: 0.2,
    });

    const promptTemplate = PromptTemplate.fromTemplate(`
      System: {system}
      
      User Question: {question}
      
      Provide a concise, personalized response in INR, referencing specific financial data. Use Indian number formatting. Suggest Indian investment options where relevant and recommend professional consultation for complex topics.
    `);

    const chain = RunnableSequence.from([
      {
        system: () => systemPrompt,
        question: (input) => input.question,
      },
      promptTemplate,
      model,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({
      question: message,
    });

    // Save chat to history
    let chat = await ChatModel.findOne({
      userId,
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      },
    });

    const currentUserType = user.isPremium ? "premium" : user.isTrial ? "trial" : "free";

    if (!chat) {
      chat = new ChatModel({
        userId,
        userType: currentUserType,
        messages: [],
        createdAt: new Date(),
      });
    } else {
      // Update userType for existing chat document
      chat.userType = currentUserType;
    }

    // Add the new message pair with timestamps
    chat.messages.push({ content: message, role: "user", timestamp: new Date() });
    chat.messages.push({ content: response, role: "assistant", timestamp: new Date() });
    chat.lastModified = new Date();

    await chat.save();

    return res.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process your request. Please try again later.",
    });
  }
};

// Get AI chat suggestions based on financial data
export const getAIChatSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    const financialData = await getFinancialData(userId);

    const suggestions = [];

    if (parseFloat(financialData.metrics.savingsRate) < 20) {
      suggestions.push("How can I improve my savings rate?");
    }

    const overBudget = financialData.budgetUtilization.filter((budget) => parseFloat(budget.percentage) > 100);
    if (overBudget.length > 0) {
      suggestions.push(`Why am I over budget in ${overBudget[0].category}?`);
    }

    const upcomingBills = financialData.bills.filter(
      (bill) =>
        new Date(bill.dueDate) > new Date() &&
        new Date(bill.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    if (upcomingBills.length > 0) {
      suggestions.push("What bills do I have coming up this week?");
    }

    if (financialData.analysis.investmentRecommendations.investableAmount > 10000) {
      suggestions.push("Where should I invest my excess cash?");
    }

    suggestions.push(
      "What will my wealth be after 5 years?",
      "How can I optimize my taxes?",
      "How can I save more money each month?",
      "Am I on track to meet my financial goals?"
    );

    return res.json({
      success: true,
      suggestions: suggestions.slice(0, 5),
    });
  } catch (error) {
    console.error("Error getting AI chat suggestions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate suggestions",
    });
  }
};

// Get chat limits
export const getChatLimits = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if subscription has expired
    const now = new Date();
    if (user.isPremium && user.subscriptionEndDate && user.subscriptionEndDate < now) {
      user.isPremium = false;
      user.subscriptionType = "none";
      user.subscriptionEndDate = now;
      await user.save();
    }

    const todayChatsCount = await ChatModel.getTodayChatsCount(userId);
    const dailyLimit = user.isPremium ? 0 : user.isTrial ? 3 : 2;

    return res.json({
      success: true,
      limits: {
        dailyCount: todayChatsCount,
        dailyLimit: dailyLimit,
        isPremium: user.isPremium,
        isTrial: user.isTrial,
      },
    });
  } catch (error) {
    console.error("Error fetching chat limits:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat limits",
    });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const chats = await ChatModel.find({ userId })
      .sort({ lastModified: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat history.",
    });
  }
};