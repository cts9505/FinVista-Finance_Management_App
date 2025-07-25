// BudgetPage.jsx - Fixed Version
import React, { useState, useEffect, useCallback, useMemo ,useRef} from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PlusCircle, FolderIcon, FileText, Calendar, CheckCircle, X, Clock, Edit2, Trash2, DollarSign, AlertTriangle, IndianRupeeIcon, Send } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";

// EmojiPicker component (unchanged)
const EmojiPicker = ({ onSelect }) => {
    const emojis = [
        "💰", "💵", "🏠", "🚗", "🍔", "👕", "💻", "🎮", "🎬", "🎓",
        "🏥", "✈️", "🎁", "🛒", "📱", "🐶", "🍎", "👶", "💄", "🛠️",
    ];

    return (
        <div className="grid grid-cols-5 gap-2 p-2 bg-white border rounded">
            {emojis.map((emoji) => (
                <button
                    key={emoji}
                    type="button"
                    onClick={() => onSelect(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

const getLocalDateString = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
        return new Date().toISOString().split("T")[0];
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function calculateDateRange(period, year, month) {
    if (typeof year !== "number" || typeof month !== "number") {
        const fallback = new Date();
        return {
            startDate: fallback.toISOString().split("T")[0],
            endDate: new Date(fallback.getFullYear(), fallback.getMonth() + 1, 0).toISOString().split("T")[0],
        };
    }

    let startDate, endDate;
    switch (period) {
        case "quarterly":
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 3, 0);
            break;
        case "biannual":
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 6, 0);
            break;
        case "annual":
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 12, 0);
            break;
        case "monthly":
        default:
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0);
    }
    return {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
    };
}

export const BudgetPage = () => {
    const {
        addBudget, updateBudget, deleteBudget, getBudgets, budgets,
        expenses, getExpenses, userData
    } = useGlobalContext();

    const currentDate = useMemo(() => new Date(), []);
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMonthlyBudgetFormOpen, setIsMonthlyBudgetFormOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysLeftInMonth = daysInMonth - currentDate.getDate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentEditBudget, setCurrentEditBudget] = useState(null);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [autoRenewalEnabled, setAutoRenewalEnabled] = useState(true);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [monthlyIncomeSet, setMonthlyIncomeSet] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [startFromMonthBeginning, setStartFromMonthBeginning] = useState(true);
    const currYear = new Date().getFullYear();
    const minDate = `${currYear}-01-01`;
    const maxDate = `${currYear}-12-31`;
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});
    const [showHistoricalBudgets, setShowHistoricalBudgets] = useState(false);
    const [renewedBudgets, setRenewedBudgets] = useState(new Set());
    const [hasUserModelBudget, setHasUserModelBudget] = useState(false);
    const [isSendSummaryModalOpen, setIsSendSummaryModalOpen] = useState(false);
    const [summaryType, setSummaryType] = useState("currentMonth");
    const [specificMonth, setSpecificMonth] = useState(currentMonth);
    const [specificYear, setSpecificYear] = useState(currentYear);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [monthlyBudget, setMonthlyBudget] = useState("0");
    const [allCategories, setAllCategories] = useState([]);
    const budgetCreationCheck = useRef({});
    const defaultCategories = [
        "Rent & Utilities", "Groceries & Essentials",
        "Entertainment & Subscriptions", "Healthcare & Insurance", "Others"
    ];

    const getMonthDateRange = (year, month) => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        return {
            startDate: getLocalDateString(startDate),
            endDate: getLocalDateString(endDate)
        };
    };

    const [inputState, setInputState] = useState(() => {
        const safeYear = currentYear || new Date().getFullYear();
        const safeMonth = currentMonth || new Date().getMonth();
        const range = getMonthDateRange(safeYear, safeMonth);

        return {
            title: "",
            amount: "",
            category: "",
            emoji: "💰",
            period: "monthly",
            autoRenew: true,
            startDate: range.startDate,
            endDate: range.endDate,
            isCustomDate: false,
        };
    });

    const { title, amount, category, emoji, period, autoRenew, startDate, endDate, isCustomDate } = inputState;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const isLoading = useMemo(() => !budgets || !expenses, [budgets, expenses]);

    useEffect(() => {
        const defaultCategories = ["Rent & Utilities", "Groceries", "Entertainment", "Healthcare", "Others"];
        const customCats = userData?.onboardingData?.customExpenseCategories?.map(c => c.name) || [];
        setAllCategories([...new Set([...defaultCategories, ...customCats])]);
    }, [userData]);

    // Fetch custom categories (caching)
    const fetchCustomCategories = useCallback(async () => {
        if (categoriesLoaded) return;
        try {
            setIsLoadingCategories(true);
            const BASE_URL = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.get(`${BASE_URL}/api/user/get-data`, {
                headers: { 'Cache-Control': 'max-age=300' }
            });
            if (response.data.success && response.data.userData?.onboardingData) {
                const customExpenseCategories = response.data.userData.onboardingData.customExpenseCategories || [];
                const customCats = customExpenseCategories.map(cat => cat.name);
                if (customCats.length > 0) setAllCategories(customCats);
                else setAllCategories(defaultCategories);
            } else {
                setAllCategories(defaultCategories);
            }
            setCategoriesLoaded(true);
        } catch (error) {
            setAllCategories(defaultCategories);
            setCategoriesLoaded(true);
        } finally {
            setIsLoadingCategories(false);
        }
    }, [categoriesLoaded]);

    useEffect(() => {
        if (!categoriesLoaded) fetchCustomCategories();
    }, [fetchCustomCategories, categoriesLoaded]);

    useEffect(() => {
        return () => setCategoriesLoaded(false);
    }, []);

    // Monthly budget record for selected period
    const monthlyBudgetRecord = useMemo(() => {
        if (!budgets) return null;
        return budgets.find(b =>
            b.title === "Monthly Budget" &&
            new Date(b.startDate).getFullYear() === selectedYear &&
            new Date(b.startDate).getMonth() === selectedMonth
        );
    }, [budgets, selectedMonth, selectedYear]);

    // Filter budgets for period
    const filteredBudgets = useMemo(() => {
        if (!budgets) return [];
        const viewDate = new Date(selectedYear, selectedMonth, 15);
        return budgets.filter(b => {
            if (!b.startDate || !b.endDate || b.title === "Monthly Budget") return false;
            return viewDate >= new Date(b.startDate) && viewDate <= new Date(b.endDate);
        });
    }, [budgets, selectedMonth, selectedYear]);

    const budgetAnalysis = useMemo(() => {
        const totalExpensesForMonth = expenses
            .filter(e => new Date(e.date).getMonth() === selectedMonth && new Date(e.date).getFullYear() === selectedYear)
            .reduce((sum, e) => sum + Number(e.amount), 0);

        const monthlyBudgetAmount = parseFloat(monthlyBudgetRecord?.amount || 0);
        const budgetRemaining = monthlyBudgetAmount - totalExpensesForMonth;

        return { monthlyBudgetAmount, totalExpensesForMonth, budgetRemaining };
    }, [expenses, monthlyBudgetRecord, selectedMonth, selectedYear]);

    useEffect(() => {
        if (startFromMonthBeginning && period !== "custom") {
            const { startDate, endDate } = calculateDateRange(period, selectedYear, selectedMonth);
            setInputState(prev => ({
                ...prev,
                startDate,
                endDate,
                isCustomDate: false,
            }));
        }
        // For custom, don't update dates here!
    }, [startFromMonthBeginning, selectedMonth, selectedYear, period]);

    const monthsLeftInYear = 11 - selectedMonth;

    useEffect(() => {
        getBudgets();
        getExpenses();
    }, [getBudgets, getExpenses]);

    useEffect(() => {
        if (isLoading) return;
        if (monthlyBudgetRecord) {
            setMonthlyBudget(String(monthlyBudgetRecord.amount));
        } else {
            setMonthlyBudget("0");
        }
    }, [isLoading, monthlyBudgetRecord]);

    const generatePeriodOptions = useCallback(() => {
        const options = [{ value: "monthly", label: "Monthly (Till end of this month)" }];
        if (monthsLeftInYear >= 3) options.push({ value: "quarterly", label: "Quarterly (for next 3 months)" });
        if (monthsLeftInYear >= 6) options.push({ value: "biannual", label: "Half Yearly (for next 6 months)" });
        if (new Date(startDate).getDate() === 1 && selectedMonth === 0) {
            options.push({ value: "annual", label: "Yearly (for next 12 months)" });
        }
        options.push({ value: "custom", label: "Custom Date Range" });
        return options;
    }, [monthsLeftInYear, startDate, selectedMonth]);

    const periodOptions = useMemo(() => generatePeriodOptions(), [generatePeriodOptions]);

    const handleSendBudgetSummary = async () => {
        try {
            setIsSubmitting(true);
            const BASE_URL = import.meta.env.VITE_BACKEND_URL;
            let payload = {};
            if (summaryType === "currentMonth") {
                payload = { type: "monthly", month: currentMonth + 1, year: currentYear };
            } else if (summaryType === "fullYear") {
                payload = { type: "yearly", year: currentYear };
            } else if (summaryType === "specificMonth") {
                payload = { type: "monthly", month: specificMonth + 1, year: specificYear };
            }
            const response = await axios.post(`${BASE_URL}/api/auth/send-budget-summary`, payload);
            if (response.data.success) {
                toast.success("Budget summary sent successfully!");
                setIsSendSummaryModalOpen(false);
            } else {
                toast.error(response.data.message || "Failed to send budget summary.");
            }
        } catch (error) {
            toast.error("Error sending budget summary. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMonthlyBudgetSubmit = async (e) => {
        e.preventDefault();
        const amountNum = parseFloat(monthlyBudget);
        if (isNaN(amountNum) || amountNum < 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        setIsSubmitting(true);
        try {
            const { startDate, endDate } = calculateDateRange("monthly", selectedYear, selectedMonth);
            const existingBudget = budgets.find(b =>
                b.title === "Monthly Budget" &&
                new Date(b.startDate).getUTCFullYear() === selectedYear &&
                new Date(b.startDate).getUTCMonth() === selectedMonth
            );
            const budgetData = {
                title: "Monthly Budget", amount: amountNum, category: "Income", emoji: "💰",
                period: "monthly", autoRenew: false, startDate, endDate,
                year: selectedYear, month: selectedMonth,
            };
            if (existingBudget) {
                await updateBudget(existingBudget._id, budgetData);
            } else {
                await addBudget(budgetData);
            }
            const BASE_URL = import.meta.env.VITE_BACKEND_URL;
            await axios.post(`${BASE_URL}/api/auth/sync-onboarding-budget`, {
                year: selectedYear,
                month: selectedMonth,
                amount: amountNum,
            });
            setIsMonthlyBudgetFormOpen(false);
        } catch (error) {
            toast.error("Failed to save or sync monthly budget.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (period !== "custom" && startDate) {
            const { endDate: calculatedEndDate } = calculateDateRange(period, startDate);
            if (calculatedEndDate) {
                setInputState((prev) => ({
                    ...prev,
                    endDate: calculatedEndDate,
                }));
            }
        }
    }, [period, startDate]);

    const getMonthlyBudgetRemaining = useCallback(() => {
        const monthlyBudget = budgets?.find(
            (budget) =>
                budget.title === "Monthly Budget" &&
                new Date(budget.startDate).getMonth() === selectedMonth &&
                new Date(budget.startDate).getFullYear() === selectedYear
        );
        if (!monthlyBudget || !expenses) return 0;
        const startDate = new Date(monthlyBudget.startDate);
        const endDate = new Date(monthlyBudget.endDate);
        const monthlyExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });
        const totalExpenses = monthlyExpenses.reduce((total, expense) => total + Number(expense.amount), 0);
        return monthlyBudget.amount - totalExpenses;
    }, [budgets, expenses, selectedMonth, selectedYear]);

    const getBudgetSpent = useCallback((budget) => {
        if (budget.used !== undefined && budget.used !== null) {
            return budget.used;
        }
        if (!expenses || !budget?.category || !budget?.startDate || !budget?.endDate) return 0;
        const start = new Date(budget.startDate);
        const end = new Date(budget.endDate);
        const relevantExpenses = expenses.filter((expense) => {
            if (!expense?.category || !expense?.date || !expense?.amount) return false;
            const expenseDate = new Date(expense.date);
            return (
                expense.category.toLowerCase() === budget.category.toLowerCase() &&
                expenseDate >= start &&
                expenseDate <= end
            );
        });
        return relevantExpenses.reduce((total, expense) => total + parseInt(expense.amount), 0);
    }, [expenses]);

    const getBudgetRemaining = useCallback((budget) => {
        if (!budget) return 0;
        const spent = getBudgetSpent(budget);
        return budget.amount - spent;
    }, [getBudgetSpent]);

    const isBudgetExpired = useCallback((budget) => {
        if (!budget?.endDate) return false;
        return new Date(budget.endDate) < new Date();
    }, []);

    const getPeriodLabel = useCallback(() => {
        switch (period) {
            case "quarterly":
                const quarter = Math.floor(selectedMonth / 3) + 1;
                return `Q${quarter} ${selectedYear}`;
            case "biannual":
                return selectedMonth < 6 ? `H1 ${selectedYear}` : `H2 ${selectedYear}`;
            case "annual":
                return `${selectedYear}`;
            default:
                return `${months[selectedMonth]} ${selectedYear}`;
        }
    }, [period, selectedMonth, selectedYear, months]);

    function handlePeriodChange(newPeriod) {
        if (newPeriod !== "custom") {
            // Only use calculateDateRange for non-custom!
            const { startDate, endDate } = calculateDateRange(newPeriod, selectedYear, selectedMonth);
            setInputState(prev => ({
                ...prev,
                period: newPeriod,
                startDate,
                endDate,
                isCustomDate: false,
            }));
        } else {
            // For custom, don't touch start/end dates!
            setInputState(prev => ({
                ...prev,
                period: newPeriod,
                isCustomDate: true,
            }));
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "period") {
            handlePeriodChange(value);
        }
        if (period === "custom" && (name === "startDate" || name === "endDate")) {
            setInputState(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }
        if (name === "startDate" && period === "custom") {
            const newStartDate = new Date(value);
            const currentEndDate = new Date(endDate);
            if (currentEndDate <= newStartDate) {
                const newEndDate = new Date(newStartDate);
                newEndDate.setDate(newEndDate.getDate() + 30);
                setInputState((prev) => ({
                    ...prev,
                    endDate: newEndDate.toISOString().split("T")[0],
                }));
            }
        } else if (type === "checkbox") {
            setInputState((prev) => ({ ...prev, [name]: checked }));
        } else {
            setInputState((prev) => ({ ...prev, [name]: value }));
            if (name === "period" && value !== "custom") {
                const { startDate: newStartDate, endDate: newEndDate } = calculateDateRange(value, startDate);
                setInputState((prev) => ({
                    ...prev,
                    startDate: newStartDate,
                    endDate: newEndDate,
                    isCustomDate: false,
                }));
            }
            if (name === "period" && value === "custom") {
                setInputState((prev) => ({
                    ...prev,
                    isCustomDate: true,
                }));
            }
            if (name === "startDate") {
                const newStartDate = new Date(value);
                const currentEndDate = new Date(endDate);
                if (newStartDate >= currentEndDate) {
                    const newEndDate = new Date(newStartDate);
                    newEndDate.setDate(newEndDate.getDate() + 1);
                    setInputState((prev) => ({
                        ...prev,
                        endDate: newEndDate.toISOString().split("T")[0],
                    }));
                }
            }
        }
    };

    const handleEmojiSelect = (selectedEmoji) => {
        setInputState((prev) => ({ ...prev, emoji: selectedEmoji }));
        setIsEmojiPickerOpen(false);
    };

    const resetForm = () => {
        setInputState({
            title: "",
            amount: "",
            category: "",
            emoji: "💰",
            period: "monthly",
            autoRenew: true,
            startDate: new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0],
            endDate: new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0],
            isCustomDate: false,
        });
        setIsEditMode(false);
        setCurrentEditBudget(null);
        setValidationErrors({});
    };

    const closeForm = () => {
        setIsFormOpen(false);
        resetForm();
        setCurrentEditBudget(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const start = new Date(inputState.startDate + 'T00:00:00');
        const end = new Date(inputState.endDate + 'T23:59:59');
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            toast.error("Invalid date range!");
            return;
        }
        const errors = {};
        if (!title.trim()) errors.title = "Title is required";
        if (!amount || isNaN(amount) || parseInt(amount) <= 0) errors.amount = "Please enter a valid amount";
        if (!category) errors.category = "Category is required";
        if (!startDate || !endDate) {
            errors.dates = "Both start and end dates are required";
        } else if (start >= end) {
            errors.endDate = "End date must be after start date";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const budgetData = {
            title: title.trim(),
            amount: parseInt(amount),
            category,
            emoji,
            period,
            autoRenew,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            year: selectedYear,
            month: selectedMonth
        };

        try {
            setIsSubmitting(true);
            if (isEditMode) {
                await updateBudget(currentEditBudget._id, budgetData);
            } else {
                await addBudget(budgetData);
            }
            setIsFormOpen(false);
            closeForm();
            await getBudgets();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save budget");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditBudget = (budget) => {
        setCurrentEditBudget(budget);
        setInputState({
            title: budget.title,
            amount: budget.amount.toString(),
            category: budget.category,
            emoji: budget.emoji || "💰",
            period: budget.period,
            autoRenew: budget.autoRenew,
            startDate: budget.startDate,
            endDate: budget.endDate,
            isCustomDate: budget.period === "custom",
        });
        setIsEditMode(true);
        setIsFormOpen(true);
    };

    const handleDeleteBudget = (budgetId, budgetTitle) => {
        if (window.confirm(`Are you sure you want to delete "${budgetTitle}" budget?`)) {
            deleteBudget(budgetId);
            setNotifications((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    message: `Budget "${budgetTitle}" has been deleted`,
                    type: "success",
                },
            ]);
            getBudgets();
        }
    };

    const dismissNotification = (id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    };

    const paginatedBudgets = filteredBudgets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    const calculatePercentage = (part, total) => {
        if (!total) return 0;
        return Math.round((part / total) * 100);
    };

    const prepareChartData = useCallback(() => {
        if (!filteredBudgets?.length && !monthlyBudget) return [];
        const data = filteredBudgets
            .filter((budget) => budget.title !== "Monthly Budget")
            .map((budget) => {
                const spent = getBudgetSpent(budget);
                const remaining = budget.amount - spent;
                return {
                    name: budget.title,
                    category: budget.category,
                    Spent: spent,
                    Remaining: remaining >= 0 ? remaining : 0,
                    OverSpent: remaining < 0 ? Math.abs(remaining) : 0,
                    Total: budget.amount,
                };
            });
        if (monthlyBudget) {
            const monthlyBudgetRemaining = getMonthlyBudgetRemaining();
            data.unshift({
                name: "Monthly Budget",
                category: "Income",
                Spent: parseInt(monthlyBudget) - monthlyBudgetRemaining,
                Remaining: monthlyBudgetRemaining >= 0 ? monthlyBudgetRemaining : 0,
                OverSpent: monthlyBudgetRemaining < 0 ? Math.abs(monthlyBudgetRemaining) : 0,
                Total: parseInt(monthlyBudget),
            });
        }
        return data;
    }, [filteredBudgets, monthlyBudget, getBudgetSpent, getMonthlyBudgetRemaining]);

    const handleAddExpense = () => {
        window.location.href = "/expenses";
    };

    const monthlyBudgetRemainingPercentage = calculatePercentage(getMonthlyBudgetRemaining(), monthlyBudget || 0);
    const hasBudgets = budgets && budgets.length > 0;

    return (
        <>
            <Sidebar onToggle={setIsSidebarCollapsed} />
            <div
                className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${
                    isSidebarCollapsed ? "ml-16" : "ml-64 max-w-full"
                }`}
            >
                <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
                    <header className="bg-white shadow-sm p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-600">Budget Management</h1>
                            <div className="bg-blue-100 p-2 rounded mb-4 text-center mt-2 text-base">
                                Currently working with budget for: <strong>{months[selectedMonth]} {selectedYear}</strong>{" "}
                                • {daysLeftInMonth} days left in {months[currentMonth]}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                                <select
                                    className="border rounded px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                >
                                    {months.map((month, index) => (
                                        <option key={index} value={index}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="border rounded px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    {[...Array(6)].map((_, i) => {
                                        const year = currYear - 5 + i;
                                        return (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center text-sm hover:bg-blue-700 transition-colors shadow-md w-full sm:w-auto justify-center sm:justify-start"
                                >
                                    <PlusCircle size={16} className="mr-2" /> New Budget
                                </button>
                                <button
                                    onClick={() => setIsSendSummaryModalOpen(true)}
                                    className="bg-green-600 text-white rounded-lg px-4 py-2 flex items-center text-sm hover:bg-green-700 transition-colors shadow-md w-full sm:w-auto justify-center sm:justify-start"
                                >
                                    <Send size={16} className="mr-2" /> Send Summary
                                </button>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6">
                        {notifications.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2 text-blue-600 flex items-center">
                                    <AlertTriangle className="mr-2" size={18} />
                                    Notifications ({notifications.length})
                                </h2>
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex items-center justify-between p-4 mb-2 rounded-lg shadow-sm border ${
                                                notification.type === "error"
                                                    ? "bg-red-50 border-red-200 text-red-800"
                                                    : notification.type === "warning"
                                                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                                                    : "bg-green-50 border-green-200 text-green-800"
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                {notification.type === "error" && <X size={18} className="mr-2" />}
                                                {notification.type === "warning" && (
                                                    <AlertTriangle size={18} className="mr-2" />
                                                )}
                                                {notification.type === "success" && (
                                                    <CheckCircle size={18} className="mr-2" />
                                                )}
                                                {notification.message}
                                            </div>
                                            <button
                                                onClick={() => dismissNotification(notification.id)}
                                                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {isMonthlyBudgetFormOpen && (
                            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-blue-600">
                                            {hasUserModelBudget ? "Confirm Monthly Budget" : "Set Monthly Budget"}
                                        </h2>
                                        <button
                                            onClick={() => setIsMonthlyBudgetFormOpen(false)}
                                            className="text-gray-500 hover:text-gray-700 p-1"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleMonthlyBudgetSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Monthly Budget for {months[selectedMonth]} {selectedYear}
                                            </label>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {hasUserModelBudget
                                                    ? "Please confirm or update your monthly budget amount."
                                                    : "Please enter your monthly budget amount."}
                                            </p>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                                                <input
                                                    type="number"
                                                    value={monthlyBudget}
                                                    onChange={(e) => setMonthlyBudget(e.target.value)}
                                                    className={`pl-8 w-full py-2 border rounded-lg text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        validationErrors.monthlyIncome ? "border-red-500" : ""
                                                    }`}
                                                    placeholder="Enter amount"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                />
                                                {validationErrors.monthlyIncome && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {validationErrors.monthlyIncome}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors shadow-sm ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                {hasUserModelBudget ? "Confirm Budget" : "Save Budget"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsMonthlyBudgetFormOpen(false)}
                                                className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 hover:bg-gray-300 transition-colors shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        {isSendSummaryModalOpen && (
                            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-blue-600">Send Budget Summary</h2>
                                        <button
                                            onClick={() => setIsSendSummaryModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700 p-1"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Summary Type
                                            </label>
                                            <select
                                                value={summaryType}
                                                onChange={(e) => setSummaryType(e.target.value)}
                                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="currentMonth">Current Month ({months[currentMonth]} {currentYear})</option>
                                                <option value="fullYear">Full Year ({currentYear})</option>
                                                <option value="specificMonth">Specific Month</option>
                                            </select>
                                        </div>
                                        {summaryType === "specificMonth" && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Month
                                                    </label>
                                                    <select
                                                        value={specificMonth}
                                                        onChange={(e) => setSpecificMonth(parseInt(e.target.value))}
                                                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        {months.map((month, index) => (
                                                            <option key={index} value={index}>
                                                                {month}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Year
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={specificYear}
                                                        onChange={(e) => setSpecificYear(parseInt(e.target.value))}
                                                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        min={currYear - 5}
                                                        max={currYear}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSendBudgetSummary}
                                                disabled={isSubmitting}
                                                className={`flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition-colors shadow-sm ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                Send Summary
                                            </button>
                                            <button
                                                onClick={() => setIsSendSummaryModalOpen(false)}
                                                className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 hover:bg-gray-300 transition-colors shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isFormOpen && (
                            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 overflow-y-auto">
                                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4 sm:my-8 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-blue-600">
                                            {isEditMode ? "Edit Budget" : "Create New Budget"}
                                        </h2>
                                        <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 p-1">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Icon
                                                </label>
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                                                        className="border rounded-lg p-2 text-2xl mr-2 ml-2 w-15 hover:bg-gray-50"
                                                    >
                                                        {emoji}
                                                    </button>
                                                    <span className="text-sm text-gray-500">Click to select an icon</span>
                                                </div>
                                                {isEmojiPickerOpen && (
                                                    <div className="mt-2 z-10 relative">
                                                        <EmojiPicker onSelect={handleEmojiSelect} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Budget Title
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                        <FileText size={16} className="text-gray-400" />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={title}
                                                        onChange={handleChange}
                                                        className={`pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            validationErrors.title
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                        }`}
                                                        placeholder="e.g. Groceries, Rent, etc."
                                                        required
                                                    />
                                                    {validationErrors.title && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {validationErrors.title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Category
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                        <FolderIcon size={16} className="text-gray-400" />
                                                    </span>
                                                        <select
                                                            value={category}
                                                            name="category"
                                                            onChange={handleChange}
                                                            className={`pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                                                                validationErrors.category
                                                                    ? "border-red-500"
                                                                    : "border-gray-300"
                                                            }`}
                                                            required
                                                        >
                                                            <option value="" disabled>Select Category</option>
                                                            {allCategories.map((cat, index) => (
                                                                <option key={index} value={cat}>
                                                                    {cat}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <svg
                                                            className="h-5 w-5 text-gray-400"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    {validationErrors.category && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {validationErrors.category}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Amount
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                        <IndianRupeeIcon size={16} className="text-gray-400" />
                                                    </span>
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        value={amount}
                                                        onChange={handleChange}
                                                        className={`pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            validationErrors.amount
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                        }`}
                                                        placeholder="0.00"
                                                        step="0.01"
                                                        min="0"
                                                        required
                                                    />
                                                    {validationErrors.amount && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {validationErrors.amount}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Period
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                        <Clock size={16} className="text-gray-400" />
                                                    </span>
                                                    <select
                                                        name="period"
                                                        value={period}
                                                        onChange={handleChange}
                                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                                        required
                                                    >
                                                        {periodOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <svg
                                                            className="h-5 w-5 text-gray-400"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Start Date
                                                </label>
                                                <div className="relative mt-4">
                                                    <div className="mb-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={startFromMonthBeginning}
                                                                onChange={(e) => setStartFromMonthBeginning(e.target.checked)}
                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                                                disabled={period !== "custom"}
                                                            />
                                                            <span className="text-gray-900">
                                                                Start from beginning of month
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {!startFromMonthBeginning && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Start Date
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                        <Calendar size={16} className="text-gray-400" />
                                                    </span>
                                                    <input
                                                        type="date"
                                                        name="startDate"
                                                        value={startDate}
                                                        onChange={handleChange}
                                                        className={`pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            validationErrors.startDate
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                        }`}
                                                        required
                                                        min={minDate}
                                                        max={maxDate}
                                                    />
                                                    {validationErrors.startDate && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {validationErrors.startDate}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {(isCustomDate || period === "custom") && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    End Date
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                        <Calendar size={16} className="text-gray-400" />
                                                    </span>
                                                    <input
                                                        type="date"
                                                        name="endDate"
                                                        value={endDate}
                                                        onChange={handleChange}
                                                        className={`pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            validationErrors.endDate
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                        }`}
                                                        required
                                                        min={new Date(startDate).toISOString().split("T")[0]}
                                                        max={maxDate}
                                                    />
                                                    {validationErrors.endDate && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {validationErrors.endDate}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="autoRenew"
                                                name="autoRenew"
                                                checked={autoRenew}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                            />
                                            <label htmlFor="autoRenew" className="text-gray-700">
                                                Auto-renew when expired
                                            </label>
                                        </div>
                                        <div className="flex justify-end space-x-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={closeForm}
                                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                                            >
                                                {isEditMode ? <Edit2 size={16} /> : <PlusCircle size={16} />}
                                                {isEditMode ? "Update Budget" : "Create Budget"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        {!hasBudgets && monthlyIncomeSet && (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
                                <div className="mb-4">
                                    <FileText size={48} className="mx-auto text-gray-400" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">No Budgets Created Yet</h2>
                                <p className="text-gray-600 mb-6">
                                    Start by creating your first budget category to track your expenses.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button
                                        onClick={() => setIsFormOpen(true)}
                                        className="bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
                                    >
                                        <PlusCircle size={16} className="mr-2" /> Create Budget
                                    </button>
                                    <button
                                        onClick={handleAddExpense}
                                        className="border border-blue-600 text-blue-600 rounded-lg px-4 py-2 flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        <IndianRupeeIcon size={16} className="mr-2" /> Add Expense
                                    </button>
                                </div>
                            </div>
                        )}
                        {hasBudgets && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                                        <h3 className="text-sm font-medium text-gray-500">Total Budgets</h3>
                                        <p className="text-2xl font-bold">{paginatedBudgets.length}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                                        <h3 className="text-sm font-medium text-gray-500">Monthly Budget</h3>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(budgetAnalysis.monthlyBudgetAmount)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                                        <h3 className="text-sm font-medium text-gray-500">Budget Remaining</h3>
                                        <p className="text-2xl font-bold">{formatCurrency(budgetAnalysis.budgetRemaining)}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                                        <h3 className="text-sm font-medium text-gray-500">Critical Budgets</h3>
                                        <p className="text-2xl font-bold">
                                            {
                                                filteredBudgets.filter((budget) => {
                                                    const remaining = getBudgetRemaining(budget);
                                                    return (remaining / budget.amount) * 100 < 25;
                                                }).length
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <h2 className="text-lg font-semibold text-blue-600 flex items-center">
                                            <Calendar className="mr-2" size={18} /> {getPeriodLabel()} Overview
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="showHistoricalBudgets"
                                                checked={showHistoricalBudgets}
                                                onChange={(e) => setShowHistoricalBudgets(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="showHistoricalBudgets" className="text-sm text-gray-700">
                                                Show Past Budgets
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold">Overall Month&apos;s Budget</h3>
                                                <div className="text-sm text-gray-500">
                                                    {monthlyBudget ? formatCurrency(monthlyBudget) : formatCurrency(0)}
                                                </div>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${
                                                        monthlyBudgetRemainingPercentage > 75
                                                            ? "bg-green-500"
                                                            : monthlyBudgetRemainingPercentage > 50
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                    }`}
                                                    style={{ width: `${monthlyBudgetRemainingPercentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 text-sm">
                                                <span className="text-gray-600">
                                                    {monthlyBudgetRemainingPercentage}% remaining
                                                </span>
                                                <span className="font-semibold">
                                                    {formatCurrency(getMonthlyBudgetRemaining())} left
                                                    <p>{formatCurrency(monthlyBudget - getMonthlyBudgetRemaining())} used</p>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <div className="flex flex-col h-full justify-between">
                                                <h3 className="font-semibold mb-4">Budget Status</h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                            <span className="text-sm">Healthy</span>
                                                        </div>
                                                        <div className="text-sm font-semibold">
                                                            {
                                                                filteredBudgets.filter((budget) => {
                                                                    if (budget.title === "Monthly Budget") return false;
                                                                    const remaining = getBudgetRemaining(budget);
                                                                    return (remaining / budget.amount) * 100 >= 50;
                                                                }).length
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                            <span className="text-sm">Warning</span>
                                                        </div>
                                                        <div className="text-sm font-semibold">
                                                            {
                                                                filteredBudgets.filter((budget) => {
                                                                    const remaining = getBudgetRemaining(budget);
                                                                    const percentage = (remaining / budget.amount) * 100;
                                                                    return percentage >= 25 && percentage < 50;
                                                                }).length
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                                            <span className="text-sm">Critical</span>
                                                        </div>
                                                        <div className="text-sm font-semibold">
                                                            {
                                                                filteredBudgets.filter((budget) => {
                                                                    const remaining = getBudgetRemaining(budget);
                                                                    return (remaining / budget.amount) * 100 < 25;
                                                                }).length
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-4">Budget Distribution</h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={prepareChartData()}
                                                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="Spent" stackId="a" fill="oklch(0.623 0.214 259.815)"/>
                                                    <Bar dataKey="Remaining" stackId="a" fill="oklch(0.723 0.219 149.579)" />
                                                    <Bar dataKey="OverSpent" stackId="a" fill="#fb2c36" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-semibold text-blue-600 flex items-center">
                                            <FileText className="mr-2" size={18} /> Budget Breakdown
                                        </h2>
                                        <button
                                            onClick={() => setIsFormOpen(true)}
                                            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center"
                                        >
                                            <PlusCircle size={14} className="mr-1" /> Add New
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {filteredBudgets.filter((budget) => budget.title !== "Monthly Budget").length ===
                                        0 ? (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                                                <FileText size={24} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No budgets found for the selected period</p>
                                            </div>
                                        ) : (
                                            filteredBudgets
                                                .filter((budget) => budget.title !== "Monthly Budget")
                                                .map((budget) => {
                                                    const spent = getBudgetSpent(budget);
                                                    const remaining = budget.amount - spent;
                                                    const percentage = calculatePercentage(spent, budget.amount);
                                                    const isExpired = isBudgetExpired(budget);
                                                    const statusColor =
                                                        percentage < 50
                                                            ? "bg-green-500"
                                                            : percentage < 75
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500";

                                                    return (
                                                        <div
                                                            key={budget._id}
                                                            className={`p-4 rounded-lg shadow-sm border ${
                                                                isExpired && !budget.autoRenew
                                                                    ? "bg-gray-50 border-gray-200"
                                                                    : "bg-white border-gray-100"
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 text-2xl mr-3">
                                                                        {budget.emoji || "💰"}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-medium">{budget.title}</h3>
                                                                        <p className="text-sm text-gray-500">
                                                                            {budget.category} • {getPeriodLabel()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditBudget(budget)}
                                                                        className="text-gray-500 hover:text-blue-600 p-1.5 rounded-full hover:bg-gray-100"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteBudget(budget._id, budget.title)
                                                                        }
                                                                        className="text-gray-500 hover:text-red-600 p-1.5 rounded-full hover:bg-gray-100"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="mt-4">
                                                                <div className="flex justify-between items-center mb-1 text-sm">
                                                                    <span
                                                                        className={`${
                                                                            isExpired && !budget.autoRenew
                                                                                ? "text-gray-500"
                                                                                : "text-gray-700"
                                                                        }`}
                                                                    >
                                                                        {formatCurrency(remaining)} of{" "}
                                                                        {formatCurrency(budget.amount)} left
                                                                    </span>
                                                                    <span
                                                                        className={`${
                                                                            isExpired && !budget.autoRenew
                                                                                ? "text-gray-500"
                                                                                : percentage > 75
                                                                                ? "text-red-600"
                                                                                : percentage > 50
                                                                                ? "text-yellow-600"
                                                                                : "text-green-600"
                                                                        } font-medium`}
                                                                    >
                                                                        {percentage.toFixed(0)}% used
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${statusColor}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-4">
                                                                    <div className="text-sm text-gray-500">
                                                                        {isExpired && !budget.autoRenew ? (
                                                                            <span className="flex items-center text-red-500">
                                                                                <AlertTriangle
                                                                                    size={14}
                                                                                    className="mr-1"
                                                                                />{" "}
                                                                                Expired
                                                                            </span>
                                                                        ) : (
                                                                            <span>
                                                                                {new Date(budget.startDate).toLocaleDateString()} -{" "}
                                                                                {new Date(budget.endDate).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleAddExpense()}
                                                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                                                    >
                                                                        <IndianRupeeIcon size={14} className="mr-1" /> Add
                                                                        Expense
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                    {paginatedBudgets.length > itemsPerPage && (
                                        <div className="flex justify-center mt-6">
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`px-3 py-1 rounded ${
                                                        currentPage === 1
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    }`}
                                                >
                                                    Previous
                                                </button>
                                                {[...Array(Math.ceil(paginatedBudgets.length / itemsPerPage))].map(
                                                    (_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setCurrentPage(i + 1)}
                                                            className={`px-3 py-1 rounded ${
                                                                currentPage === i + 1
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                            }`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    )
                                                )}
                                                <button
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            Math.min(
                                                                prev + 1,
                                                                Math.ceil(paginatedBudgets.length / itemsPerPage)
                                                            )
                                                        )
                                                    }
                                                    disabled={
                                                        currentPage === Math.ceil(paginatedBudgets.length / itemsPerPage)
                                                    }
                                                    className={`px-3 py-1 rounded ${
                                                        currentPage ===
                                                        Math.ceil(paginatedBudgets.length / itemsPerPage)
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    }`}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default BudgetPage;