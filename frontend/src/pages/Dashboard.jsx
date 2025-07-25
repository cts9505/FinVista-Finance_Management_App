import React, { useState, useContext, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { GlobalContext } from '../context/GlobalContext';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
  Plus,
  Clock,
  ChevronRight,
  Zap,
  Bell,
  Settings,
  Info,
  User,
  Smartphone,
  Calendar,
  Shield,
  Award,
  Key,
  Edit3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  Cell,
} from 'recharts';

// Blue color palette for Expense theme and pie charts
const EXPENSE_COLORS = [
  '#00bfff', '#0099cc', '#006699', '#004466', '#002233', '#51a7f9', '#5bc0eb', '#0074d9'
];
const INCOME_COLORS = [
  '#59d98c', '#2ecc71', '#27ae60', '#229954', '#16a085', '#81c784', '#43a047', '#76d7c4'
];
const BUDGET_COLORS = [
  '#f39c12', '#e67e22', '#d35400', '#f1c40f', '#f7ca18'
];

// Animate container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.1, staggerChildren: 0.1 },
  },
};

// Animate card
const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 12, stiffness: 100 } },
};

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    totalIncome,
    totalExpenses,
    totalBalance,
  } = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [incomePieData, setIncomePieData] = useState([]);
  const [expensePieData, setExpensePieData] = useState([]);
  const [budgetPieData, setBudgetPieData] = useState([]);
  const [latestBudgets, setLatestBudgets] = useState([]);
  const [latestBills, setLatestBills] = useState([]);
  const [latestExpenses, setLatestExpenses] = useState([]);
  const [latestIncomes, setLatestIncomes] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([getIncomes(), getExpenses(), getBills(), getBudgets()]);
      setIsLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!isLoading) {
      generateTrendData();
      generatePieData();
      getLatestBudgets();
      getLatestBills();
      getLatestExpenses();
      getLatestIncomes();
    }
    // eslint-disable-next-line
  }, [incomes, expenses, bills, budgets, isLoading]);

  // --- Trend Area chart (6 months)
  const generateTrendData = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        income: 0,
        expense: 0,
        bills: 0,
        balance: 0,
      });
    }
    incomes?.forEach(income => {
      const d = new Date(income.date);
      const idx = months.findIndex(m => m.month === d.toLocaleString('default', { month: 'short' }) && m.year === d.getFullYear());
      if (idx !== -1) months[idx].income += income.amount;
    });
    expenses?.forEach(expense => {
      const d = new Date(expense.date);
      const idx = months.findIndex(m => m.month === d.toLocaleString('default', { month: 'short' }) && m.year === d.getFullYear());
      if (idx !== -1) months[idx].expense += expense.amount;
    });
    bills?.forEach(bill => {
      const d = new Date(bill.dueDate);
      const idx = months.findIndex(m => m.month === d.toLocaleString('default', { month: 'short' }) && m.year === d.getFullYear());
      if (idx !== -1) months[idx].bills += bill.amount;
    });
    months.forEach(m => m.balance = m.income - m.expense - m.bills);
    setTrendData(months);
  };

  // --- Pie Data
  const generatePieData = () => {
    // Income Pie
    const incomeCatMap = {};
    incomes?.forEach(i => {
      incomeCatMap[i.category] = (incomeCatMap[i.category] || 0) + i.amount;
    });
    setIncomePieData(
      Object.keys(incomeCatMap).map((cat, idx) => ({
        name: cat,
        value: incomeCatMap[cat],
        color: INCOME_COLORS[idx % INCOME_COLORS.length]
      }))
    );
    // Expense Pie
    const expenseCatMap = {};
    expenses?.forEach(e => {
      expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
    });
    setExpensePieData(
      Object.keys(expenseCatMap).map((cat, idx) => ({
        name: cat,
        value: expenseCatMap[cat],
        color: EXPENSE_COLORS[idx % EXPENSE_COLORS.length]
      }))
    );
    // Budget Pie
    setBudgetPieData(
      (budgets || []).map((budget, idx) => ({
        name: budget.title || budget.category || `Budget ${idx + 1}`,
        value: budget.amount,
        color: BUDGET_COLORS[idx % BUDGET_COLORS.length]
      }))
    );
  };

  // Latest 5 budgets
  const getLatestBudgets = () => {
    setLatestBudgets(
      [...(budgets || [])]
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, 5)
    );
  };

  // Latest 5 bills
  const getLatestBills = () => {
    setLatestBills(
      [...(bills || [])]
        .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
        .slice(0, 5)
    );
  };

  // Latest 5 expenses
  const getLatestExpenses = () => {
    setLatestExpenses(
      [...(expenses || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    );
  };

  // Latest 5 incomes
  const getLatestIncomes = () => {
    setLatestIncomes(
      [...(incomes || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    );
  };

  // Format date for display
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Sidebar onToggle={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 overflow-y-auto ${isSidebarCollapsed ? 'ml-16 ' : 'ml-64 max-w-full'}`}
        style={{ background: 'linear-gradient(135deg, #eaf6fc, #dbeafe 85%)' }}
      >

        {/* User Card */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex gap-6 items-center bg-white rounded-xl shadow-lg border-2 border-blue-200 p-7">
            <img
              src={userData?.image || "/user-avatar.png"}
              alt={userData?.name}
              className="rounded-full border-2 border-blue-300 w-24 h-24 object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-blue-700">{userData?.name || "User"}</h1>
              <p className="text-gray-700 font-medium">{userData?.email}</p>
              <div className="flex flex-wrap gap-3 text-sm mt-2">
                <span className="flex items-center gap-1 text-blue-500"><User size={16} /> Age: {userData?.age}</span>
                <span className="flex items-center gap-1 text-blue-500"><Smartphone size={16} /> {userData?.phone}</span>
                <span className="flex items-center gap-1 text-blue-500"><Calendar size={16} /> Joined: {formatDate(userData?.createdAt)}</span>
                <span className="flex items-center gap-1 text-blue-500"><Shield size={16} /> {userData?.isAccountVerified ? "Verified" : "Not Verified"}</span>
                {userData?.isPremium && (
                  <span className="flex items-center gap-1 text-yellow-600 font-bold"><Award size={16} /> Premium</span>
                )}
                {userData?.isAdmin && (
                  <span className="flex items-center gap-1 text-indigo-600 font-bold"><Key size={16} /> Admin</span>
                )}
              </div>
            </div>
            <div className="ml-auto flex flex-col gap-3">
              <span className="text-xs text-gray-400">Last Login: {formatDate(userData?.lastLogin)}</span>
              <span className="text-xs text-gray-400">Account: {userData?.isDeactivated ? "Deactivated" : "Active"}</span>
            </div>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl mb-8 border border-blue-200"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center"
            >
              <Zap className="text-white" size={22} />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                <Sparkles className="mr-2 text-blue-500" size={18} />
                AI Financial Insights
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {totalBalance() > 0
                  ? `Excellent! You have a healthy positive balance of ₹${totalBalance().toLocaleString()}. Consider investing or saving for your future goals.`
                  : totalBalance() === 0
                    ? "You're breaking even this month. Try increasing your income or reducing expenses."
                    : `You're overspending by ₹${Math.abs(totalBalance()).toLocaleString()}. Consider reviewing your expenses and budget!`}
              </p>
              <div className="mt-3 text-sm text-gray-600">
                Risk Level: <span className="font-bold text-blue-700">{userData?.onboardingData?.riskLevel}</span>
                {userData?.onboardingData?.isCurrentlyInvesting && (
                  <span className="ml-5">Investments: <span className="font-bold text-green-600">{userData?.onboardingData?.investmentTypes?.join(', ') || "N/A"}</span></span>
                )}
                {userData?.onboardingData?.savingsGoal && (
                  <span className="ml-5">Savings Goal: <span className="font-bold text-yellow-600">₹{userData?.onboardingData?.savingsGoal.toLocaleString()}</span></span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: "Total Balance",
              amount: totalBalance(),
              icon: <Wallet size={24} />,
              bg: "bg-blue-100",
              text: "text-blue-700",
            },
            {
              title: "Total Income",
              amount: totalIncome || 0,
              icon: <TrendingUp size={24} />,
              bg: "bg-green-100",
              text: "text-green-600",
            },
            {
              title: "Total Expenses",
              amount: totalExpenses || 0,
              icon: <TrendingDown size={24} />,
              bg: "bg-red-100",
              text: "text-red-600",
            },
            {
              title: "Total Bills",
              amount: bills?.reduce((t, b) => t + b.amount, 0) || 0,
              icon: <Receipt size={24} />,
              bg: "bg-indigo-100",
              text: "text-indigo-600",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200 flex flex-col gap-2`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center ${card.text}`}>
                  {card.icon}
                </div>
                <span className={`font-bold text-lg ${card.text}`}>{card.title}</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">₹{card.amount.toLocaleString()}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Area Chart: Financial Trend */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="text-blue-500" size={22} />
              <h2 className="text-xl font-bold text-blue-700">Financial Trends (6 months)</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
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
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#59d98c" fill="url(#incomeGradient)" />
                <Area type="monotone" dataKey="expense" stroke="#00bfff" fill="url(#expenseGradient)" />
                <Area type="monotone" dataKey="bills" stroke="#6366F1" fill="url(#billsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Charts Column */}
          <div className="flex flex-col gap-8">
            {/* Income Pie */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <PieChart className="text-green-500" size={22} />
                <h2 className="text-lg font-bold text-green-600">Income by Category</h2>
              </div>
              {incomePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={70}
                      labelLine={false}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {incomePieData.map((entry, idx) => (
                        <Cell key={`cell-income-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 py-12 text-center">No income data</div>
              )}
            </div>
            {/* Expense Pie */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <PieChart className="text-blue-500" size={22} />
                <h2 className="text-lg font-bold text-blue-600">Expense by Category</h2>
              </div>
              {expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={70}
                      labelLine={false}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensePieData.map((entry, idx) => (
                        <Cell key={`cell-expense-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 py-12 text-center">No expense data</div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Budgets and Bills */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Latest Budgets (with name) */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Target className="text-blue-700" size={22} />
              <h2 className="text-xl font-bold text-blue-700">Latest Budgets</h2>
            </div>
            {latestBudgets.length > 0 ? (
              <ul>
                {latestBudgets.map((budget, idx) => (
                  <li key={budget._id || idx} className="flex justify-between items-center py-2 border-b">
                    <span className="font-semibold">{budget.title || budget.category || `Budget ${idx + 1}`}</span>
                    <span className="text-gray-500 text-sm">
                      ₹{budget.amount.toLocaleString()} • {formatDate(budget.startDate)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 py-12 text-center">No budgets found</div>
            )}
            {/* Budget Pie Chart */}
            <div className="mt-6">
              <h3 className="text-md font-bold text-yellow-600 mb-2">Budget Distribution</h3>
              {budgetPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={budgetPieData}
                      cx="50%" cy="50%"
                      innerRadius={30} outerRadius={60}
                      labelLine={false}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {budgetPieData.map((entry, idx) => (
                        <Cell key={`cell-budget-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 py-6 text-center">No budget data</div>
              )}
            </div>
          </div>
          {/* Latest Bills */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-indigo-600" size={22} />
              <h2 className="text-xl font-bold text-indigo-600">Latest Bills</h2>
            </div>
            {latestBills.length > 0 ? (
              <ul>
                {latestBills.map((bill, idx) => (
                  <li key={bill._id || idx} className="flex justify-between items-center py-2 border-b">
                    <span className="font-semibold">{bill.title || bill.category || `Bill ${idx + 1}`}</span>
                    <span className="text-gray-500 text-sm">
                      ₹{bill.amount.toLocaleString()} • Due {formatDate(bill.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 py-12 text-center">No bills found</div>
            )}
          </div>
        </div>

        {/* Latest Expenses & Incomes */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Latest Expenses */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <ArrowDownRight className="text-blue-600" size={22} />
              <h2 className="text-lg font-bold text-blue-600">Latest Expenses</h2>
            </div>
            {latestExpenses.length > 0 ? (
              <ul>
                {latestExpenses.map((expense, idx) => (
                  <li key={expense._id || idx} className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2 text-xl">{expense.emoji || '🛒'} <span className="font-semibold text-gray-700">{expense.title}</span></span>
                    <span className="text-gray-500 text-sm">₹{expense.amount.toLocaleString()} • {formatDate(expense.date)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 py-12 text-center">No expenses found</div>
            )}
          </div>
          {/* Latest Incomes */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <ArrowUpRight className="text-green-600" size={22} />
              <h2 className="text-lg font-bold text-green-600">Latest Incomes</h2>
            </div>
            {latestIncomes.length > 0 ? (
              <ul>
                {latestIncomes.map((income, idx) => (
                  <li key={income._id || idx} className="flex justify-between items-center py-2 border-b">
                    <span className="flex items-center gap-2 text-xl">{income.emoji || '💰'} <span className="font-semibold text-gray-700">{income.title}</span></span>
                    <span className="text-gray-500 text-sm">₹{income.amount.toLocaleString()} • {formatDate(income.date)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 py-12 text-center">No incomes found</div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 text-base"
        >
          <p>
            Last updated: {new Date().toLocaleDateString()} • {incomes?.length || 0} incomes • {expenses?.length || 0} expenses • {bills?.length || 0} bills • {budgets?.length || 0} budgets
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;