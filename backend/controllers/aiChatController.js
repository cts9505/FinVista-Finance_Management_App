import { GoogleGenerativeAI } from "@google/generative-ai";

import userModel from "../models/model.js";
import incomeModel from "../models/IncomeModel.js";
import expenseModel from "../models/ExpenseModel.js";
import budgetModel from "../models/BudgetModel.js";
import billModel from "../models/BillModel.js";
import dotenv from "dotenv";
import { projectFutureWealth, analyzeSavingsOpportunities, generateInvestmentRecommendations } from "../utils/financialUtils.js";
import ChatModel from "../models/ChatModel.js";
import { get } from "mongoose";

dotenv.config();

// --- OPTIMIZATION: In-Memory Cache (Retained) ---
const financialDataCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // Cache data for 10 minutes

// --- Prompt Template for Gemini (Function is unchanged) ---
const buildSystemPrompt = (financialData) => {
  const { profile, metrics, monthlySummary, expenseBreakdown, budgetUtilization, incomes, expenses, bills, analysis } = financialData;
  return `
    You are a world-class personal financial assistant for users in India, responding in Indian Rupees (INR, ₹) and using Indian number formatting.

    YOUR TASKS:
    - Reference the user's real financial data below.
    - Give concise, actionable, practical advice.
    - Suggest Indian options for investments, savings, tax, etc. when relevant.
    - For taxes/legal, recommend professional consultation.
    - Keep responses concise and actionable.

    USER PROFILE:
    Name: ${profile.name}
    Employment Status: ${profile.onboardingData?.employmentStatus || "Not specified"}
    Yearly Income: ₹${(profile.onboardingData?.yearlyIncome || 0).toLocaleString("en-IN")}
    Age: ${profile.age || "Not specified"}
    Risk Level: ${profile.onboardingData?.riskLevel || "Moderate"}
    Financial Goals: ${(profile.onboardingData?.financialGoals || []).join(", ") || "None"}
    Financial Habits: ${(profile.onboardingData?.financialHabits || []).join(", ") || "None"}
    Currently Investing: ${profile.onboardingData?.isCurrentlyInvesting ? "Yes" : "No"}
    Investment Types: ${(profile.onboardingData?.investmentTypes || []).join(", ") || "None"}
    Wants Investment Advice: ${profile.onboardingData?.wantsInvestmentRecommendations ? "Yes" : "No"}

    FINANCIAL METRICS:
    Total Income: ₹${metrics.totalIncome.toLocaleString("en-IN")}
    Total Expenses: ₹${metrics.totalExpenses.toLocaleString("en-IN")}
    Balance: ₹${metrics.totalBalance.toLocaleString("en-IN")}
    Savings Rate: ${metrics.savingsRate}%

    RECENT MONTHLY SUMMARY (Last 6 Months):
    ${monthlySummary.map(m => `- ${m.month}: Income ₹${m.income.toLocaleString("en-IN")}, Expenses ₹${m.expense.toLocaleString("en-IN")}, Savings ₹${m.savings.toLocaleString("en-IN")}`).join("\n")}

    TOP EXPENSE CATEGORIES:
    ${expenseBreakdown.slice(0, 5).map(cat => `- ${cat.category}: ₹${cat.amount.toLocaleString("en-IN")}`).join("\n")}

    ACTIVE BUDGETS:
    ${budgetUtilization.map(b => `- ${b.title} (${b.category}, ${b.period}): ₹${b.spent.toLocaleString("en-IN")} spent of ₹${b.budgeted.toLocaleString("en-IN")} (${b.percentage}%)`).join("\n")}

    RECENT INCOME SOURCES:
    ${incomes.slice(0, 5).map(i => `- ${i.title || i.category}: ₹${i.amount.toLocaleString("en-IN")} (${new Date(i.date).toLocaleDateString("en-IN")})`).join("\n")}

    RECENT EXPENSES:
    ${expenses.slice(0, 5).map(e => `- ${e.title || e.category}: ₹${e.amount.toLocaleString("en-IN")} (${new Date(e.date).toLocaleDateString("en-IN")})`).join("\n")}

    UPCOMING BILLS:
    ${bills.filter(b => new Date(b.dueDate) > new Date()).slice(0, 5).map(b => `- ${b.title}: ₹${b.amount.toLocaleString("en-IN")} (Due: ${new Date(b.dueDate).toLocaleDateString("en-IN")})`).join("\n")}

    FINANCIAL PROJECTIONS:
    - Projected wealth in 5 years: ₹${analysis.futureWealth.projectedWealth.toLocaleString("en-IN")}
    - Annual savings: ₹${analysis.futureWealth.assumptions.annualSavings.toLocaleString("en-IN")}
    - Potential monthly extra savings: ₹${analysis.savingsOpportunities.totalPotentialSavings.toLocaleString("en-IN")}

    INVESTMENT RECOMMENDATIONS:
    - Risk profile: ${analysis.investmentRecommendations.riskProfile}
    - Emergency fund: ₹${analysis.investmentRecommendations.recommendedEmergencyFund.toLocaleString("en-IN")}
    - Investable amount: ₹${analysis.investmentRecommendations.investableAmount.toLocaleString("en-IN")}
    - Suggested allocation: ${Object.entries(analysis.investmentRecommendations.recommendedAllocation).filter(([k])=>k!=="description").map(([k,v])=>`${k}: ${v}%`).join(", ")}

    INSTRUCTIONS:
    - Respond to the user's question using the data above.
    - Personalize your answer.
    - Use Indian context and INR.
    - Suggest Indian investment options where appropriate.
    - For tax/legal or complex matters, recommend consulting a professional.
    - Keep answers concise, practical, and actionable.
      `;
};

// Get comprehensive financial data for a user (Optimized version is retained)
const getFinancialData = async (userId) => {
  const cached = financialDataCache.get(userId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[Cache] HIT for userId: ${userId}`);
    return cached.data;
  }
  console.log(`[Cache] MISS for userId: ${userId}. Fetching from DB.`);

  try {
    const [user, incomes, expenses, budgets, bills] = await Promise.all([
        userModel.findById(userId),
        incomeModel.find({ userId }).sort({ date: -1 }),
        expenseModel.find({ userId }).sort({ date: -1 }),
        budgetModel.find({ userId }),
        billModel.find({ userId })
    ]);

    if (!user) throw new Error("User not found");
    
    // ... all calculations are the same as before ...
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
      const monthlyIncome = incomes.filter(income => { const d = new Date(income.date); return d >= monthStart && d <= monthEnd; }).reduce((s, i) => s + i.amount, 0);
      const monthlyExpense = expenses.filter(expense => { const d = new Date(expense.date); return d >= monthStart && d <= monthEnd; }).reduce((s, e) => s + e.amount, 0);
      lastSixMonths.unshift({ month: `${month} ${year}`, income: monthlyIncome, expense: monthlyExpense, savings: monthlyIncome - monthlyExpense });
    }
    const expenseCategories = expenses.reduce((acc, expense) => { acc[expense.category] = (acc[expense.category] || 0) + expense.amount; return acc; }, {});
    const sortedExpenseCategories = Object.entries(expenseCategories).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
    const budgetUtilization = budgets.map((budget) => {
      const spent = expenses.filter((e) => e.category === budget.category).reduce((s, e) => s + e.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { category: budget.category, title: budget.title, budgeted: budget.amount, spent, period: budget.period, startDate: budget.startDate, endDate: budget.endDate, percentage: percentage.toFixed(2) };
    });
    const activeBudgets = budgetUtilization.filter(b => { const now = new Date(); return new Date(b.startDate) <= now && new Date(b.endDate) >= now; });
    const futureWealth = projectFutureWealth({ metrics: { totalIncome, totalExpenses, totalBalance } });
    const savingsOpportunities = analyzeSavingsOpportunities(expenses);
    const investmentRecommendations = generateInvestmentRecommendations(user, { totalBalance, totalExpenses, savingsRate: parseFloat(savingsRate) });
    
    const comprehensiveData = {
      profile: user,
      metrics: { totalIncome, totalExpenses, totalBalance, savingsRate: savingsRate.toFixed(2) },
      monthlySummary: lastSixMonths,
      expenseBreakdown: sortedExpenseCategories,
      budgetUtilization: activeBudgets,
      incomes, expenses, budgets, bills,
      analysis: { futureWealth, savingsOpportunities, investmentRecommendations },
    };
    
    financialDataCache.set(userId, { data: comprehensiveData, timestamp: Date.now() });
    return comprehensiveData;
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
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Subscription and rate limit checks (unchanged)
    const now = new Date();
    if (user.isPremium && user.subscriptionEndDate && new Date(user.subscriptionEndDate) < now) {
      user.isPremium = false;
      user.subscriptionType = "none";
      user.subscriptionEndDate = now;
      await user.save();
      financialDataCache.delete(userId);
    }
    if (!user.isPremium) {
      const todayChatsCount = await ChatModel.getTodayChatsCount(userId);
      const dailyLimit = user.isTrial ? 3 : 2;
      if (todayChatsCount >= dailyLimit) {
        return res.status(403).json({ success: false, message: "You've reached your daily chat limit" });
      }
    }

    // Caching is retained for performance
    const financialData = await getFinancialData(userId);
    
    // --- REFACTORED (No LangChain) ---
    // 1. Manually build the full prompt string
    const systemPrompt = buildSystemPrompt(financialData);
    const fullPrompt = `
      ${systemPrompt}

      User Question: ${message}
      
      Provide a concise, personalized response in INR, referencing specific financial data. Use Indian number formatting. Suggest Indian investment options where relevant and recommend professional consultation for complex topics.
    `;

    // 2. Initialize the Google AI Client and model
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
      },
    });

    // 3. Call the model and parse the response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponseText = response.text();
    // --- End of Refactored Block ---

    // Save chat to history (using the aiResponseText variable)
    let chat = await ChatModel.findOne({
      userId,
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      },
    });
    const currentUserType = user.isPremium ? "premium" : user.isTrial ? "trial" : "free";
    if (!chat) {
      chat = new ChatModel({ userId, userType: currentUserType, messages: [], createdAt: new Date() });
    } else {
      chat.userType = currentUserType;
    }
    chat.messages.push({ content: message, role: "user", timestamp: new Date() });
    chat.messages.push({ content: aiResponseText, role: "assistant", timestamp: new Date() });
    chat.lastModified = new Date();
    await chat.save();

    return res.json({ success: true, message: aiResponseText });

  } catch (error) {
    console.error("Error in AI chat:", error);
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(503).json({ success: false, message: "AI insights are currently unavailable due to high demand. Please try again in a few minutes." });
    }
    return res.status(500).json({ success: false, message: "Failed to process your request. Please try again later." });
  }
};

// All other functions remain the same as the previously optimized version

export const getAIChatSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    const financialData = await getFinancialData(userId); // Benefits from cache
    const suggestions = [];
    if (parseFloat(financialData.metrics.savingsRate) < 20) suggestions.push("How can I improve my savings rate?");
    const overBudget = financialData.budgetUtilization.filter(b => parseFloat(b.percentage) > 100);
    if (overBudget.length > 0) suggestions.push(`Why am I over budget in ${overBudget[0].category}?`);
    const upcomingBills = financialData.bills.filter(b => new Date(b.dueDate) > new Date() && new Date(b.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    if (upcomingBills.length > 0) suggestions.push("What bills do I have coming up this week?");
    if (financialData.analysis.investmentRecommendations.investableAmount > 10000) suggestions.push("Where should I invest my excess cash?");
    suggestions.push("What will my wealth be after 5 years?", "How can I optimize my taxes?", "How can I save more money each month?", "Am I on track to meet my financial goals?");
    return res.json({ success: true, suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    console.error("Error getting AI chat suggestions:", error);
    return res.status(500).json({ success: false, message: "Failed to generate suggestions" });
  }
};

export const getChatLimits = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const now = new Date();
    if (user.isPremium && user.subscriptionEndDate && new Date(user.subscriptionEndDate) < now) {
      user.isPremium = false;
      user.subscriptionType = "none";
      user.subscriptionEndDate = now;
      await user.save();
      financialDataCache.delete(userId);
    }
    const todayChatsCount = await ChatModel.getTodayChatsCount(userId);
    const dailyLimit = user.isPremium ? 0 : user.isTrial ? 3 : 2;
    return res.json({ success: true, limits: { dailyCount: todayChatsCount, dailyLimit: dailyLimit, isPremium: user.isPremium, isTrial: user.isTrial } });
  } catch (error) {
    console.error("Error fetching chat limits:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch chat limits" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;
    const chats = await ChatModel.find({ userId }).sort({ lastModified: -1 }).skip((page - 1) * limit).limit(Number(limit));
    return res.json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch chat history." });
  }
};

const GENERAL_QUOTES = ["Wealth consists not in having great possessions, but in having few wants.", "Do not save what is left after spending, but spend what is left after saving.", "A penny saved is a penny earned.", "Budgeting isn't about limiting yourself — it's about making the things that excite you possible.", "Financial freedom is available to those who learn about it and work for it.", "It's not your salary that makes you rich, it's your spending habits.", "Beware of little expenses; a small leak will sink a great ship.", "The best time to plant a tree was 20 years ago. The second best time is now."];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getDailyInsight = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const today = startOfToday();
    const chat = await ChatModel.findOne({ userId, "messages.role": "daily_insight", "messages.timestamp": { $gte: today } });
    if (chat) {
      const msg = chat.messages.find(m => m.role === 'daily_insight' && new Date(m.timestamp) >= today);
      if (msg) return res.json({ success: true, insight: msg.content });
    }
    let insight;
    if (user.isPremium || user.isTrial) {
      const financialData = await getFinancialData(userId); // Uses cache
      const systemPrompt = buildSystemPrompt(financialData);
      const insightPrompt = `As a financial assistant, analyze the user's financial data above and generate a single, highly personalized, concise financial insight or tip relevant for today. Highlight a positive trend, an area for improvement, or a reminder aligned with the user's goals, habits, or current situation. Keep it motivational and actionable, and do not repeat previous days' advice. Return only the insight (1-2 sentences).`;
      const fullPrompt = `${systemPrompt}\n\n${insightPrompt}`;

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 256, temperature: 0.3 }
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      insight = response.text().trim() || "Stay focused on your financial goals today!";
      // --- End of Refactored Block ---
    } else {
      const idx = Math.floor(Math.random() * GENERAL_QUOTES.length);
      insight = GENERAL_QUOTES[idx];
    }
    let chatToday = await ChatModel.findOne({ userId, createdAt: { $gte: today } });
    if (!chatToday) {
      chatToday = new ChatModel({ userId, userType: user.isPremium ? "premium" : (user.isTrial ? "trial" : "free"), messages: [], createdAt: new Date() });
    }
    chatToday.messages = chatToday.messages.filter(msg => msg.role !== 'daily_insight' || new Date(msg.timestamp) < today);
    chatToday.messages.push({ content: insight, role: "daily_insight", timestamp: new Date() });
    chatToday.lastModified = new Date();
    await chatToday.save();
    return res.json({ success: true, insight });
  } catch (error) {
    console.error("Error in getDailyInsight:", error);
    return res.status(500).json({ success: false, insight: "Unable to fetch daily insights. Please try again later." });
  }
};
