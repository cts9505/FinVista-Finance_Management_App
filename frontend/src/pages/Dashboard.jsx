import React, { useState, useContext, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { GlobalContext } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet, TrendingUp, TrendingDown, Receipt, FileText, PieChart,
  ArrowUpRight, ArrowDownRight, Target, Sparkles, Clock, Zap, User,
  Smartphone, Calendar, Shield, Award, Key, AlertCircle, RefreshCw,
  Flame, Star, Trophy, Crown, Gift, Brain, Loader2, PartyPopper
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Color palettes
const EXPENSE_COLORS = [
  '#00bfff', '#0099cc', '#006699', '#004466', '#002233', '#51a7f9', '#5bc0eb', '#0074d9'
];
const INCOME_COLORS = [
  '#59d98c', '#2ecc71', '#27ae60', '#229954', '#16a085', '#81c784', '#43a047', '#76d7c4'
];
const BUDGET_COLORS = [
  '#f39c12', '#e67e22', '#d35400', '#f1c40f', '#f7ca18'
];

// Confetti/Rolling Paper Celebration Animation
const ConfettiCanvas = ({ show }) => {
  useEffect(() => {
    if (!show) return;
    // Simple rolling paper/confetti effect
    const canvas = document.getElementById('confetti-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const particles = [];
    const colors = ['#f39c12', '#00bfff', '#59d98c', '#e67e22', '#59d9c0', '#f7ca18', '#7f8c8d', '#c0392b'];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * -H,
        r: 8 + Math.random() * 12,
        d: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleIncremental: (Math.random() * 0.07) + .05
      });
    }
    let angle = 0;
    let animationFrame;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      angle += 0.01;
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      }
      update();
      animationFrame = requestAnimationFrame(draw);
    }
    function update() {
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(angle);
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        if (p.y > H) {
          p.x = Math.random() * W;
          p.y = -10;
        }
      }
    }
    draw();
    return () => {
      cancelAnimationFrame(animationFrame);
      ctx && ctx.clearRect(0, 0, W, H);
    };
  }, [show]);
  return (
    <canvas
      id="confetti-bg"
      className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 120 } }
};
const celebrationVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: "spring", damping: 10, stiffness: 200, duration: 0.6 }
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.3 } }
};

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Chart data states
  const [trendData, setTrendData] = useState([]);
  const [incomePieData, setIncomePieData] = useState([]);
  const [expensePieData, setExpensePieData] = useState([]);
  const [budgetPieData, setBudgetPieData] = useState([]);
  const [monthlyBudgetData, setMonthlyBudgetData] = useState([]); // For monthwise budgets

  // Latest data states
  const [latestBudgets, setLatestBudgets] = useState([]);
  const [latestBills, setLatestBills] = useState([]);
  const [latestExpenses, setLatestExpenses] = useState([]);
  const [latestIncomes, setLatestIncomes] = useState([]);

  const {
    userData,
    incomes,
    expenses,
    bills,
    budgets,
    getIncomes,
    getExpenses,
    getBills,
    getBudgets,
    getUserData,
    error,
    setError,
  } = useContext(GlobalContext);

  // Celebration effect for streak milestones
  useEffect(() => {
    const streak = userData?.loginStreak || 0;
    if (streak > 0 && (streak === 3 || streak === 7 || streak === 14 || streak === 30 || streak % 50 === 0)) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [userData?.loginStreak]);

  // Get streak badge based on login streak
  const getStreakBadge = (streak) => {
    if (streak >= 30) return { icon: <Crown className="text-purple-600" size={20} />, text: "Legend", color: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200" };
    if (streak >= 14) return { icon: <Trophy className="text-yellow-600" size={20} />, text: "Champion", color: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200" };
    if (streak >= 7) return { icon: <Award className="text-blue-600" size={20} />, text: "Warrior", color: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200" };
    if (streak >= 3) return { icon: <Star className="text-green-600" size={20} />, text: "Rising Star", color: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200" };
    return { icon: <Flame className="text-orange-600" size={20} />, text: "Beginner", color: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200" };
  };

  // Calculate totals safely
  const calculateTotals = () => {
    const totalIncome = Array.isArray(incomes)
      ? incomes.reduce((sum, income) => sum + (income.amount || 0), 0)
      : 0;
    const totalExpenses = Array.isArray(expenses)
      ? expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      : 0;
    const totalBills = Array.isArray(bills)
      ? bills.reduce((sum, bill) => sum + (bill.amount || 0), 0)
      : 0;
    const totalBalance = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, totalBills, totalBalance };
  };

  const [imgError, setImgError] = useState(false);

  // Fetch daily AI insight
  const fetchDailyInsight = async () => {
    try {
      setIsLoadingInsight(true);
      const response = await fetch(`${BASE_URL}/api/userchat/get-daily-insight`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAiInsight(data.insight || 'No insights available today.');
      } else {
        setAiInsight('Unable to fetch daily insights. Please try again later.');
      }
    } catch (err) {
      setAiInsight('Error loading insights. Please check your connection.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  // Fetch all data with proper error handling
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setDataError(null);
      const promises = [
        getUserData(),
        getIncomes(),
        getExpenses(),
        getBills(),
        getBudgets()
      ];
      await Promise.allSettled(promises);
    } catch (err) {
      setDataError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  // Process data when it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        generateTrendData();
        generatePieData();
        processLatestData();
        processMonthlyBudgets();
      } catch (err) {
        setDataError('Error processing dashboard data');
      }
    }
  }, [incomes, expenses, bills, budgets, userData, isLoading]);

  // Generate trend data for the last 6 months
  const generateTrendData = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        income: 0,
        expense: 0,
        bills: 0,
        balance: 0,
      });
    }
    // Incomes
    if (Array.isArray(incomes)) {
      incomes.forEach(income => {
        try {
          const date = new Date(income.date);
          const monthStr = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const monthIndex = months.findIndex(m => m.month === monthStr && m.year === year);
          if (monthIndex !== -1) {
            months[monthIndex].income += income.amount || 0;
          }
        } catch {}
      });
    }
    // Expenses
    if (Array.isArray(expenses)) {
      expenses.forEach(expense => {
        try {
          const date = new Date(expense.date);
          const monthStr = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const monthIndex = months.findIndex(m => m.month === monthStr && m.year === year);
          if (monthIndex !== -1) {
            months[monthIndex].expense += expense.amount || 0;
          }
        } catch {}
      });
    }
    // Bills
    if (Array.isArray(bills)) {
      bills.forEach(bill => {
        try {
          const date = new Date(bill.dueDate);
          const monthStr = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const monthIndex = months.findIndex(m => m.month === monthStr && m.year === year);
          if (monthIndex !== -1) {
            months[monthIndex].bills += bill.amount || 0;
          }
        } catch {}
      });
    }
    // Calculate balance for each month
    months.forEach(month => {
      month.balance = month.income - month.expense - month.bills;
    });
    setTrendData(months);
  };

  // Process monthly budgets from onboarding data (plots: Aug, Sep, ...)
  const processMonthlyBudgets = () => {
    let monthlyBudgets = userData?.onboardingData?.monthlyBudgets || [];
    if (!Array.isArray(monthlyBudgets)) monthlyBudgets = [];
    // Only keep items with amount > 0
    monthlyBudgets = monthlyBudgets.filter(b => b.amount > 0);
    // Group by "Aug 2025", "Sep 2025", ...
    const grouped = {};
    monthlyBudgets.forEach(budget => {
      const monthName = new Date(budget.year, budget.month - 1).toLocaleString('default', { month: 'short' });
      const key = `${monthName} ${budget.year}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += budget.amount;
    });
    setMonthlyBudgetData(Object.entries(grouped).map(([month, amount], idx) => ({
      name: month,
      value: amount,
      color: BUDGET_COLORS[idx % BUDGET_COLORS.length]
    })));
  };

  // Generate pie chart data for Income/Expense
  const generatePieData = () => {
    // Income pie data
    const incomeCategoryMap = {};
    if (Array.isArray(incomes)) {
      incomes.forEach(income => {
        if (income.amount > 0) {
          const category = income.category || 'Other';
          incomeCategoryMap[category] = (incomeCategoryMap[category] || 0) + income.amount;
        }
      });
    }
    setIncomePieData(
      Object.entries(incomeCategoryMap)
        .filter(([_, value]) => value > 0)
        .map(([category, amount], index) => ({
          name: category,
          value: amount,
          color: INCOME_COLORS[index % INCOME_COLORS.length]
        }))
    );

    // Expense pie data
    const expenseCategoryMap = {};
    if (Array.isArray(expenses)) {
      expenses.forEach(expense => {
        if (expense.amount > 0) {
          const category = expense.category || 'Other';
          expenseCategoryMap[category] = (expenseCategoryMap[category] || 0) + expense.amount;
        }
      });
    }
    setExpensePieData(
      Object.entries(expenseCategoryMap)
        .filter(([_, value]) => value > 0)
        .map(([category, amount], index) => ({
          name: category,
          value: amount,
          color: EXPENSE_COLORS[index % EXPENSE_COLORS.length]
        }))
    );

    // Budget pie data (legacy, shown only if not using monthly budgets)
    if (Array.isArray(budgets)) {
      setBudgetPieData(
        budgets
          .filter(budget => budget.amount > 0)
          .map((budget, index) => ({
            name: budget.title || budget.category || `Budget ${index + 1}`,
            value: budget.amount || 0,
            color: BUDGET_COLORS[index % BUDGET_COLORS.length]
          }))
      );
    }
  };

  // Process latest data for each category
  const processLatestData = () => {
    // Latest budgets
    if (Array.isArray(budgets)) {
      const sortedBudgets = [...budgets]
        .filter(b => b.amount > 0)
        .sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt))
        .slice(0, 5);
      setLatestBudgets(sortedBudgets);
    }

    // Latest bills
    if (Array.isArray(bills)) {
      const sortedBills = [...bills]
        .filter(b => b.amount > 0)
        .sort((a, b) => new Date(b.dueDate || b.createdAt) - new Date(a.dueDate || a.createdAt))
        .slice(0, 5);
      setLatestBills(sortedBills);
    }

    // Latest expenses
    if (Array.isArray(expenses)) {
      const sortedExpenses = [...expenses]
        .filter(e => e.amount > 0)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 5);
      setLatestExpenses(sortedExpenses);
    }

    // Latest incomes
    if (Array.isArray(incomes)) {
      const sortedIncomes = [...incomes]
        .filter(i => i.amount > 0)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 5);
      setLatestIncomes(sortedIncomes);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Calculate totals
  const { totalIncome, totalExpenses, totalBills, totalBalance } = calculateTotals();
  // Get streak badge
  const streakBadge = getStreakBadge(userData?.loginStreak || 0);

  // Filter out zero/empty values for savingsGoal and investmentTypes in UI below
  const savingsGoal = userData?.onboardingData?.savingsGoal;
  const investmentTypes = userData?.onboardingData?.investmentTypes || [];
  const showInvestments = userData?.onboardingData?.isCurrentlyInvesting && Array.isArray(investmentTypes) && investmentTypes.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
        <span className="ml-4 text-indigo-500 font-medium text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <Sidebar onToggle={setIsSidebarCollapsed} />

      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            variants={celebrationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30 pointer-events-none"
          >
            <div className="text-center">
            {/* Confetti celebration */}
            <ConfettiCanvas show={showCelebration} />
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <motion.h2
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl font-bold text-black mb-2"
              >
                Streak Milestone!
              </motion.h2>
              <p className="text-xl text-black">
                {userData?.loginStreak} days strong! Keep it up! 🔥
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 transition-all duration-300 overflow-y-auto min-h-screen ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
        style={{ background: 'bg-white' }}
      >
        {/* Error Banner */}
        {(dataError || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 shadow-lg"
          >
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <span className="text-red-700 flex-1">{dataError || error}</span>
            <button
              onClick={() => {
                setDataError(null);
                setError(null);
                fetchAllData();
              }}
              className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 text-sm transition-colors flex-shrink-0"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Retry</span>
            </button>
          </motion.div>
        )}

        {/* User Card with Login Streak */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 lg:p-7">
            <div className="flex gap-4 sm:gap-6 items-center flex-1">
              <img
                src={userData?.image && !imgError ? userData.image : undefined}
                alt="User Profile"
                className="rounded-full border-2 border-blue-300 w-20 h-20 sm:w-24 sm:h-24 object-cover bg-blue-800"
                onError={() => setImgError(true)}
              />

              {(!userData?.image || imgError) && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full border-2 border-blue-300 bg-blue-700 absolute">
                  <User size={40} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-blue-700">{userData?.name || "User"}</h1>
                <p className="text-gray-700 font-medium">{userData?.email || "No email"}</p>
                <div className="flex flex-wrap gap-2 sm:gap-3 text-sm mt-2">
                  {userData?.age > 0 && (
                    <span className="flex items-center gap-1 text-blue-100">
                      <User size={16} /> Age: {userData.age}
                    </span>
                  )}
                  {userData?.phone && (
                    <span className="flex items-center gap-1 text-blue-500">
                      <Smartphone size={16} /> {userData.phone}
                    </span>
                  )}
                  {userData?.createdAt && (
                    <span className="flex items-center gap-1 text-blue-500">
                      <Calendar size={16} /> Joined: {formatDate(userData.createdAt)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-blue-500">
                    <Shield size={16} />
                    {userData?.isAccountVerified ? "Verified" : "Not Verified"}
                  </span>
                  {userData?.isPremium && (
                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                      <Award size={16} /> Premium
                    </span>
                  )}
                  {userData?.isAdmin && (
                    <span className="flex items-center gap-1 text-indigo-600 font-bold">
                      <Key size={16} /> Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Login Streak Section */}
            <div className="flex flex-col items-center lg:items-end gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  >
                    <Flame className="text-orange-500" size={24} />
                  </motion.div>
                  <span className="text-2xl font-bold text-orange-600">
                    {userData?.loginStreak || 0}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">Day Streak</span>
                <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${streakBadge.color}`}>
                  {streakBadge.icon}
                  <span className="text-sm font-bold">{streakBadge.text}</span>
                </div>
                {userData?.loginStreak >= 30 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200"
                  >
                    <Gift className="text-purple-600" size={16} />
                    <span className="text-sm font-bold text-purple-700">Monthly Achiever</span>
                  </motion.div>
                )}
              </motion.div>
              {userData?.lastLogin && (
                <div className="text-xs text-gray-400 text-right">
                  <div>Last Login: {formatDate(userData.lastLogin)}</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8 border border-indigo-200 shadow-xl backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0 rgba(99, 102, 241, 0.4)",
                  "0 0 0 10px rgba(99, 102, 241, 0)",
                  "0 0 0 0 rgba(99, 102, 241, 0)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            >
              <Zap className="text-white" size={24} />
            </motion.div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h3 className="font-bold text-gray-800 flex items-center text-lg">
                  <Sparkles className="mr-2 text-indigo-500" size={20} />
                  AI Financial Insights
                </h3>
                <button
                  onClick={fetchDailyInsight}
                  disabled={isLoadingInsight}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoadingInsight ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Brain size={16} />
                  )}
                  <span className="hidden sm:inline">Get Today&apos;s Insight</span>
                  <span className="sm:hidden">Get Insight</span>
                </button>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                {aiInsight || (totalBalance > 0
                  ? `Excellent! You have a healthy positive balance of ₹${totalBalance.toLocaleString()}. Consider investing or saving for your future goals.`
                  : totalBalance === 0
                    ? "You're breaking even this month. Try increasing your income or reducing expenses."
                    : `You're overspending by ₹${Math.abs(totalBalance).toLocaleString()}. Consider reviewing your expenses and budget!`)}
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
                  Risk: <span className="font-bold text-indigo-700">{userData?.onboardingData?.riskLevel || "Not Set"}</span>
                </span>
                {showInvestments && (
                  <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
                    Investments: <span className="font-bold text-green-600">
                      {investmentTypes.slice(0, 2).join(', ')}
                      {investmentTypes.length > 2 && '...'}
                    </span>
                  </span>
                )}
                {userData?.onboardingData?.savingsGoal > 0 && (
                  <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
                    Goal (Monthly Saving): <span className="font-bold text-yellow-600">
                      ₹{savingsGoal.toLocaleString()}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Overview Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          {[
            {
              title: "Total Balance",
              amount: totalBalance,
              icon: <Wallet size={20} className="sm:w-6 sm:h-6" />,
              bg: "bg-gradient-to-br from-blue-100 to-indigo-200",
              text: "text-blue-700",
              border: "border-blue-300",
            },
            {
              title: "Total Income",
              amount: totalIncome,
              icon: <TrendingUp size={20} className="sm:w-6 sm:h-6" />,
              bg: "bg-gradient-to-br from-green-100 to-emerald-200",
              text: "text-green-600",
              border: "border-green-300",
            },
            {
              title: "Total Expenses",
              amount: totalExpenses,
              icon: <TrendingDown size={20} className="sm:w-6 sm:h-6" />,
              bg: "bg-gradient-to-br from-red-100 to-pink-200",
              text: "text-red-600",
              border: "border-red-300",
            },
            {
              title: "Total Bills",
              amount: totalBills,
              icon: <Receipt size={20} className="sm:w-6 sm:h-6" />,
              bg: "bg-gradient-to-br from-indigo-100 to-purple-200",
              text: "text-indigo-600",
              border: "border-indigo-300",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 ${card.border} flex flex-col gap-2 sm:gap-3 hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl ${card.bg} flex items-center justify-center ${card.text} shadow-md`}>
                  {card.icon}
                </div>
                <span className={`font-bold text-xs sm:text-sm lg:text-base ${card.text} leading-tight`}>{card.title}</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                ₹{card.amount.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Financial Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <PieChart className="text-white" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Financial Trends (6 months)
            </h2>
          </div>
          {trendData.length > 0 ? (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#59d98c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#59d98c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bfff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00bfff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="billsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eaf6fc" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="#59d98c" fill="url(#incomeGradient)" />
                  <Area type="monotone" dataKey="expense" stroke="#00bfff" fill="url(#expenseGradient)" />
                  <Area type="monotone" dataKey="bills" stroke="#6366F1" fill="url(#billsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-400 py-12 text-center">No trend data available</div>
          )}
        </motion.div>

        {/* Charts Section - Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Budget Overview (Monthwise) */}
          {monthlyBudgetData.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-blue-200 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-orange-500" size={22} />
                <h2 className="text-lg sm:text-xl font-bold text-orange-600">Monthly Budgets Overview</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={monthlyBudgetData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={120}
                    dataKey="value"
                    fill="#8884d8"
                  >
                    {monthlyBudgetData.map((entry, index) => (
                      <Cell key={`cell-mb-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Fallback: Budget Pie Overview if no monthly budgets */}
          {monthlyBudgetData.length === 0 && budgetPieData.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-blue-200 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-orange-500" size={22} />
                <h2 className="text-lg sm:text-xl font-bold text-orange-600">Budget Overview</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={budgetPieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={120}
                    dataKey="value"
                    fill="#8884d8"
                  >
                    {budgetPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Pie Charts Column */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Income Pie */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <PieChart className="text-green-500" size={22} />
                <h2 className="text-lg font-bold text-green-600">Income by Category</h2>
              </div>
              {incomePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={70}
                      dataKey="value"
                      fill="#8884d8"
                    >
                      {incomePieData.map((entry, index) => (
                        <Cell key={`cell-income-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 py-8 text-center">No income data</div>
              )}
            </div>
            {/* Expense Pie */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <PieChart className="text-blue-500" size={22} />
                <h2 className="text-lg font-bold text-blue-600">Expenses by Category</h2>
              </div>
              {expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={70}
                      dataKey="value"
                      fill="#8884d8"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-expense-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 py-8 text-center">No expense data</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Latest Income */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="text-white" size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Recent Income
              </h2>
            </div>
            {latestIncomes.length > 0 ? (
              <div className="space-y-3">
                {latestIncomes.map((income, index) => (
                  <motion.div 
                    key={income._id || index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {income.title || income.description || 'Income'}
                      </div>
                      <div className="text-xs sm:text-sm text-green-600 font-medium">
                        {income.category || 'Other'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {formatDate(income.date)}
                      </div>
                    </div>
                    <div className="text-green-600 font-bold text-sm sm:text-base flex-shrink-0">
                      +₹{(income.amount || 0).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 py-12 text-center">
                <ArrowUpRight size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recent income</p>
              </div>
            )}
          </motion.div>

          {/* Latest Expenses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="text-white" size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Recent Expenses
              </h2>
            </div>
            {latestExpenses.length > 0 ? (
              <div className="space-y-3">
                {latestExpenses.map((expense, index) => (
                  <motion.div 
                    key={expense._id || index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {expense.title || expense.description || 'Expense'}
                      </div>
                      <div className="text-xs sm:text-sm text-red-600 font-medium">
                        {expense.category || 'Other'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {formatDate(expense.date)}
                      </div>
                    </div>
                    <div className="text-red-600 font-bold text-sm sm:text-base flex-shrink-0">
                      -₹{(expense.amount || 0).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 py-12 text-center">
                <ArrowDownRight size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recent expenses</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bills and Budget Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Latest Bills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Receipt className="text-white" size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Upcoming Bills
              </h2>
            </div>
            {latestBills.length > 0 ? (
              <div className="space-y-3">
                {latestBills.map((bill, index) => (
                  <motion.div 
                    key={bill._id || index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {bill.title || bill.description || 'Bill'}
                      </div>
                      <div className="text-xs sm:text-sm text-indigo-600 font-medium">
                        {bill.category || 'Other'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        Due: {formatDate(bill.dueDate)}
                      </div>
                    </div>
                    <div className="text-indigo-600 font-bold text-sm sm:text-base flex-shrink-0">
                      ₹{(bill.amount || 0).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 py-12 text-center">
                <Receipt size={48} className="mx-auto mb-4 opacity-50" />
                <p>No upcoming bills</p>
              </div>
            )}
          </motion.div>

          {/* Latest Budgets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Active Budgets
              </h2>
            </div>
            {latestBudgets.length > 0 ? (
              <div className="space-y-3">
                {latestBudgets.map((budget, index) => (
                  <motion.div 
                    key={budget._id || index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {budget.title || budget.category || 'Budget'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">
                          {budget.title=="Monthly Budget" ? "" : budget.description || 'No description'}
                        </div>
                      </div>
                      <div className="text-orange-600 font-bold text-sm sm:text-base flex-shrink-0">
                        ₹{(budget.amount || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(budget.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(budget.endDate)}
                      </span>
                    </div>
                    {budget.spent !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Spent: ₹{budget.spent.toLocaleString()}</span>
                          <span className="font-bold">{Math.round((budget.spent / budget.amount) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 py-12 text-center">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p>No active budgets</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Enhanced Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 rounded-2xl border border-indigo-200 shadow-xl"
        >
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 flex items-center gap-2">
            <Zap size={20} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                icon: <TrendingUp className="text-green-500" size={20} />,
                label: "Add Income",
                bg: "from-green-100 to-emerald-100",
                border: "border-green-200",
                to: "/incomes"
              },
              {
                icon: <TrendingDown className="text-red-500" size={20} />,
                label: "Add Expense",
                bg: "from-red-100 to-pink-100",
                border: "border-red-200",
                to: "/expenses"
              },
              {
                icon: <Receipt className="text-indigo-500" size={20} />,
                label: "Add Bill",
                bg: "from-indigo-100 to-purple-100",
                border: "border-indigo-200",
                to: "/bills"
              },
              {
                icon: <Target className="text-orange-500" size={20} />,
                label: "New Budget",
                bg: "from-orange-100 to-red-100",
                border: "border-orange-200",
                to: "/budgets"
              },
            ].map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Link
                  to={action.to}
                  className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br ${action.bg} rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all border ${action.border} w-full`}
                  style={{ textDecoration: 'none' }}
                >
                  {action.icon}
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;