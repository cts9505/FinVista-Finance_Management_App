import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"; // Add useMemo
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircle2, Mail, ShieldCheck, Key } from 'lucide-react'
import { AppContent } from "./AppContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const GlobalContext = createContext();  // ✅ Named export

const GlobalContextProvider = ({ children }) => {
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [bills, setBills] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [error, setError] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [userData, setUserData] = useState(null);
    
    const addIncome = async (income) => {
        try {
        const response = await axios.post(`${BASE_URL}/api/auth/add-income`, income);

        if (response && response.data) {
            getIncomes(); 
            // console.log("Respnose:", response);
            toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
            return response.data;
           
        } else {
            throw new Error("Invalid response from server");
        }
    } catch (err) {
        console.error("Error adding income:", err);

        // Handle cases where err.response is undefined
        toast.error(err.response?.data?.message || "An unexpected error occurred.");
        setError(err.response?.data?.message || "An unexpected error occurred.");
    }
    };

    const updateIncome = async (incomeId, updatedIncome) => {
        try {
            const response = await axios.put(`${BASE_URL}/api/auth/update-income/${incomeId}`, updatedIncome);
    
            if (response && response.data) {
                console.log(response.data.message);
                getIncomes(); // Refresh incomes list after updating
                // console.log("Response:", response);
                toast.success(response.data.message, {
                    icon: <CheckCircle2 className="text-green-500" />
                  })
                return response.data;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error("Error updating income:", err);
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
            setError(err.response?.data?.message || "An unexpected error occurred.");
        }
    };
    
    // Similar modification for getExpenses
   
    const deleteIncome = async (id) => {
        try{
            const response= await axios.delete(`${BASE_URL}/api/auth/delete-income/${id}`);
        getIncomes();
        toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
    }
        catch(err){
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const addExpense = async (expense) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/add-expense`, expense);
    
            if (response && response.data) {
                getExpenses(); 
                toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
                // console.log("Respnose:", response);
                return response.data;
               
            } else {
                throw new Error("Invalid response from server");
            }
            
        } catch (err) {
            console.error("Error adding income:", err);
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
            // Handle cases where err.response is undefined
            setError(err.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const updateExpense= async (expenseId, updatedExpense) => {
        try {
            const response = await axios.put(`${BASE_URL}/api/auth/update-expense/${expenseId}`, updatedExpense);

            if (response && response.data) {
                getExpenses(); // Refresh incomes list after updating
                // console.log("Response:", response);
                toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
                return response.data;
            } else {
                toast.error(response.message);
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error("Error updating expense:", err);
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
            setError(err.response?.data?.message || "An unexpected error occurred.");
        }
    };


// Similar modification for getExpenses
    const deleteExpense = async (id) => {
        try{const response = await axios.delete(`${BASE_URL}/api/auth/delete-expense/${id}`);
        getExpenses();
        console.log(response.message);
        toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
    }
        catch(err){
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const addBill = async (bill) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/add-bill`, bill);
            if (response && response.data) {
                getBills();
                toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
                return response.data;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error("Error adding bill:", err);
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
            setError(err.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const updateBill = async (billId, updatedBill) => {
        try {
            const response = await axios.put(`${BASE_URL}/api/auth/update-bill/${billId}`, updatedBill);
            if (response && response.data) {
                getBills(); 
                toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
                return response.data;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error("Error updating bill:", err);
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
            setError(err.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const deleteBill = async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/api/auth/delete-bill/${id}`);
            getBills();
            toast.success(response.data.message, {
                icon: <CheckCircle2 className="text-green-500" />
              })
        } catch (err) {
            toast.error(err.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const getIncomes = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/auth/get-incomes`);
            if (response?.data?.incomes) {
                setIncomes(response.data.incomes);
            }
        } catch (err) {
            console.error("Error fetching incomes:", err);
            setError(err.response?.data?.message || "Failed to fetch incomes.");
        }
    }, []);

    const getExpenses = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/auth/get-expenses`);
            if (response?.data?.expenses) {
                setExpenses(response.data.expenses);
            }
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setError(err.response?.data?.message || "Failed to fetch expenses.");
        }
    }, []);

    const getBudgets = useCallback(async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/get-budgets`);
    if (response.data.success) {
      setBudgets(prevBudgets => {
        // Only update if the data has changed
        if (JSON.stringify(prevBudgets) !== JSON.stringify(response.data.budgets)) {
          return response.data.budgets;
        }
        return prevBudgets;
      });
    }
  } catch (error) {
    console.error("Error fetching budgets:", error);
  }
}, []);
    
    const getBills = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/auth/get-bills`);
            if (response?.data?.bills) {
                setBills(response.data.bills);
            }
        } catch (err) {
            console.error("Error fetching bills:", err);
        }
    }, []);

    const getUserData = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/user/get-data`);
            if (response.data.success) {
                setUserData(response.data.userData);
            }
        } catch (error) {
            console.error("Get user data error:", error);
        }
    }, []);


    // --- CRUD OPERATIONS ---

    const addBudget = useCallback(async (budgetData) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/add-budget`, budgetData);
            if (response.data.success) {
                toast.success(response.data.message || "Budget created!");
                await getBudgets(); // Refresh data
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }, [getBudgets]);

    const updateBudget = useCallback(async (budgetId, updatedBudget) => {
        try {
            const response = await axios.put(`${BASE_URL}/api/auth/update-budget/${budgetId}`, updatedBudget);
            if (response.data.success) {
                toast.success(response.data.message || "Budget updated!");
                await getBudgets(); // Refresh data
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }, [getBudgets]);
    
    const deleteBudget = useCallback(async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/api/auth/delete-budget/${id}`);
            if (response.data.success) {
                toast.success(response.data.message || "Budget deleted!");
                await getBudgets(); // Refresh data
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }, [getBudgets]);

    // Helper function to update budget tracking when new expenses are added
    const updateBudgetTracking = (expense) => {
        // Find all budgets that match this expense's category and date range
        const matchingBudgets = budgets.filter(budget => {
            const budgetStartDate = new Date(budget.startDate);
            const budgetEndDate = new Date(budget.endDate);
            const expenseDate = new Date(expense.date);
            
            return budget.category === expense.category && 
                   expenseDate >= budgetStartDate && 
                   expenseDate <= budgetEndDate;
        });
    };

    const checkPremiumStatus = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/auth/check-premium-status`);
          if (response.data.success) {
            setIsPremium(response.data.isPremium);
            setSubscriptionData({
              type: response.data.subscriptionType,
              endDate: response.data.subscriptionType === 'trial' ? 
                response.data.trialEndDate : response.data.subscriptionEndDate,
              daysRemaining: response.data.daysRemaining
            });
          }
        } catch (err) {
          console.error("Error checking premium status:", err);
        }
      };

    const totalBalance = () => totalIncome - totalExpenses;

    const transactionHistory = () => {
        return [...incomes, ...expenses]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
    };


const contextValue = useMemo(() => ({
                getUserData,
                userData,
                addIncome,
                getIncomes,
                updateIncome,
                addBudget,
                getBudgets,
                setBudgets,
                budgets,
                updateBudget,
                deleteBudget,
                updateBudgetTracking,
                incomes,
                deleteIncome,
                expenses,
                totalIncome,
                addExpense,
                getExpenses,
                updateExpense,
                deleteExpense,
                totalExpenses,
                bills,  // ✅ Expose bills state
                addBill,  // ✅ Expose bill functions
                getBills,
                updateBill,
                deleteBill,
                totalBalance,
                transactionHistory,
                error,
                setError,
                isPremium,
                subscriptionData,
                checkPremiumStatus,
}), [userData, budgets, expenses, incomes, bills, addBudget, getBudgets, updateBudget, deleteBudget, getExpenses, getIncomes]); // Add ALL functions and state to the dependency array

// In GlobalContext.jsx

// Assuming you get login state from another context, e.g., AppContext
const { isLoggedin } = useContext(AppContent); 

useEffect(() => {
    // Only run these functions if the user is logged in
    if (isLoggedin) {
        getUserData();
        getIncomes();
        getExpenses();
        getBudgets();
        getBills();
        checkPremiumStatus();
    }
}, [isLoggedin, getBudgets, getExpenses, getIncomes, getBills]); // Add isLoggedin to dependency array
    return (
        <GlobalContext.Provider value={contextValue}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalContextProvider");
    }
    return context;
};

export default GlobalContextProvider;