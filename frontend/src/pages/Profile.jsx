import React, { useState, useEffect ,useContext ,useRef} from 'react';
import { 
  User, Mail, Phone, Home, Edit3, LogOut, AlertCircle, Info, 
  CreditCard, MapPin, Briefcase, DollarSign, Settings, Check, X, 
  Calendar, Clock, Bell, Eye, EyeOff, 
  Shield, Trash2, GripVertical,Save,ShieldCheck,
  FolderOpen,Edit,ArrowUpCircle,ArrowDownCircle,Award,
  Download,TrendingUp,Scissors,PlusCircle,IndianRupee,ReceiptIndianRupee,
  PlusSquare,Plus,MinusCircle,MinusSquare,Minus,
  CheckCircle,CheckSquare,Star,Laptop, Smartphone, Globe,
  ShieldAlertIcon,
  BugIcon,
  Contact,
  Loader2,
  Camera,
  BugOffIcon,
  BugPlay,
  BugPlayIcon,
  StarsIcon,
  StarOffIcon,
  Loader
} from 'lucide-react';
import axios from 'axios';
import SecurityTab from '../components/ChangePassword'
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { formatDistanceToNow } from 'date-fns';
import ChangePasswordForm from '../components/ChangePassword';
import { AppContent } from '../context/AppContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GlobalContext, useGlobalContext } from '../context/GlobalContext';
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaStarOfLife } from 'react-icons/fa';
import PasswordModal from '../components/PasswordModal'; // Adjust path if needed

// Base URL for API calls - replace with your actual base URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const CategoryAPI = {
  addCategory: async (categoryType, categoryName) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/add-category`, {
        categoryType,
        categoryName
      }, { withCredentials: true });
      if (!response.data.success) throw new Error(response.data.message || 'Failed to add category');
      return response.data.category; // Should be { _id, name }
    } catch (error) {
      console.error('Error adding category:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  editCategory: async (categoryType, categoryId, newCategoryName) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/auth/edit-category`, {
        categoryType,
        categoryId,
        newCategoryName
      }, { withCredentials: true });
      if (!response.data.success) throw new Error(response.data.message || 'Failed to edit category');
      return response.data; // Adjust based on backend response
    } catch (error) {
      console.error('Error editing category:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  deleteCategory: async (categoryType, categoryId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/auth/delete-category`, {
        data: { categoryType, categoryId },
        withCredentials: true
      });
      if (!response.data.success) throw new Error(response.data.message || 'Failed to delete category');
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  updateCategoryOrder: async (categoryType, categories) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/auth/update-category-order`, {
        categoryType,
        categories
      }, { withCredentials: true });
      if (!response.data.success) throw new Error(response.data.message || 'Failed to update category order');
      toast.success("Updated order of categories!");
      return response.data;
    } catch (error) {
      console.error('Error updating category order:', {
        message: error.message,
        response: error.response?.data
      });
      toast.error(error.response?.data?.message || "Failed to update category order");
      throw error;
    }
  }
};

// Separate component for category form to avoid conditional hooks
const CategoryForm = ({
  editingSection,
  setEditingSection,
  categoryType,
  editingCategory,
  setUserData,
  setError,
  categoryOptions,
  userData, // New prop to check existing categories
  onClose, // New prop to close the modal
}) => {
  const [categoryName, setCategoryName] = useState(editingCategory?.name || '');
  const [selectedOption, setSelectedOption] = useState('');

  const existingCategories =
    categoryType === 'income'
      ? userData.onboardingData.customIncomeCategories
      : userData.onboardingData.customExpenseCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = categoryName || selectedOption;
    if (!name) {
      setError('Please provide a category name.');
      toast.error('Please provide a category name.');
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = existingCategories.some(
      (cat) =>
        cat.name.toLowerCase() === name.toLowerCase() &&
        // Allow editing the same category without triggering duplicate error
        (editingSection !== 'editCategory' || cat._id !== editingCategory?.id)
    );
    if (isDuplicate) {
      setError('Category already exists.');
      toast.error('Category already exists.');
      return;
    }

    try {
      let updatedCategory;
      if (editingSection === 'editCategory') {
        await CategoryAPI.editCategory(categoryType, editingCategory.id, name);
        updatedCategory = { _id: editingCategory.id, name };
      } else {
        const newCategory = await CategoryAPI.addCategory(categoryType, name);
        updatedCategory = newCategory;
      }

      setUserData((prev) => {
        const updatedCategories =
          editingSection === 'editCategory'
            ? prev.onboardingData[
                categoryType === 'income'
                  ? 'customIncomeCategories'
                  : 'customExpenseCategories'
              ].map((cat) =>
                cat._id === updatedCategory._id ? updatedCategory : cat
              )
            : [
                ...prev.onboardingData[
                  categoryType === 'income'
                    ? 'customIncomeCategories'
                    : 'customExpenseCategories'
                ],
                updatedCategory,
              ];

        return {
          ...prev,
          onboardingData: {
            ...prev.onboardingData,
            [categoryType === 'income' ? 'customIncomeCategories' : 'customExpenseCategories']:
              updatedCategories,
          },
        };
      });

      setEditingSection(null);
      setCategoryName('');
      setSelectedOption('');
      onClose(); // Close the modal
      toast.success(
        `Category ${editingSection === 'editCategory' ? 'updated' : 'added'} successfully`
      );
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save category');
    }
  };

  // Filter out existing categories from dropdown options
  const filteredOptions = categoryOptions.filter(
    (option) =>
      !existingCategories.some((cat) => cat.name.toLowerCase() === option.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all duration-300 scale-100 hover:scale-105">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-700">
            {editingSection === 'editCategory' ? 'Edit' : 'Add'}{' '}
            {categoryType === 'income' ? 'Income' : 'Expense'} Category
          </h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setSelectedOption(option);
                      setCategoryName('');
                    }}
                    className={`cursor-pointer p-3 border rounded-lg flex justify-between items-center ${
                      selectedOption === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{option}</span>
                    {selectedOption === option && (
                      <Check className="text-blue-600" size={16} />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-2">
                  No new categories available. Add custom ones below.
                </p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Or Enter Custom Category
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setSelectedOption('');
              }}
              placeholder={`Enter custom ${categoryType} category`}
              className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {editingSection === 'editCategory' ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [editingSection, setEditingSection] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, mode: 'change' });
  const { setIsLoggedin, backendUrl } = useContext(AppContent);
  const { addExpense } = useGlobalContext();
  const [newItem, setNewItem] = useState('');
  const [originalData, setOriginalData] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const currentYear = new Date().getFullYear();
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [categoryOptions, setCategoryOptions] = useState([]);
  const incomeSourceOptions = [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Rental",
    "Passive Income",
  ];
  const expenseCategoryOptions = [
    "Rent/Mortgage",
    "Food",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Health",
    "Trip",
    "Loans",
    "Insurance",
  ];
  const employmentOptions = ["Student", "Salaried", "Self-employed", "Business Owner", "Retired", "Unemployed"];
  const financialGoalOptions = ["Budgeting & Expense Tracking", "Saving & Investing", "Debt Management", "Income Tracking", "Retirement Planning", "Financial Education"];
  const financialHabitsOptions = ["Careful Planner", "Occasional Spender", "Impulsive Buyer", "Investor", "Saver", "Budget Follower"];
  const investmentTypeOptions = ["Stocks", "Bonds", "Mutual Funds", "Real Estate", "Crypto", "Gold", "Fixed Deposits"];
  const riskLevelOptions = ["Low", "Moderate", "High"];
  const [bugReports, setBugReports] = useState([]);
  const [expandedReport, setExpandedReport] = useState(null);
  // Add these states inside your component before the return statement
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSecondConfirmModal, setShowSecondConfirmModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Confirmation message object
  const confirmationMessages = {
    expenses: 'Are you sure you want to delete all expense records? This action cannot be undone.',
    income: 'Are you sure you want to delete all income records? This action cannot be undone.',
    bills: 'Are you sure you want to delete all bill records? This action cannot be undone.',
    budgets: 'Are you sure you want to delete all budget settings? This action cannot be undone.',
    categories: 'Are you sure you want to delete all custom categories? Default categories will remain. This action cannot be undone.',
    transactions: 'Are you sure you want to delete all transaction records? This action cannot be undone.',
    devices: 'Are you sure you want to remove all devices from your account? You will need to login again on all devices.',
    account: 'Are you sure you want to delete your account? All your data will be lost and cannot be recovered.'
  };
  
  // Handle the first confirmation click
  const handleDeleteConfirmation = (type) => {
    setConfirmationType(type);
    setShowConfirmModal(true);
  };
  
  // Handle the first confirmation modal submission
  const handleFirstConfirmation = () => {
    setShowConfirmModal(false);
    setShowSecondConfirmModal(true);
  };
  
  // Handle the second confirmation modal submission
  const handleSecondConfirmation = async () => {
    // Validation already handled by disabled button state
    try {
      let response;
      
      switch(confirmationType) {
        case 'expenses':
          response = await axios.delete(`${BASE_URL}/api/auth/delete-all-expenses`, { 
            data: { password },
            withCredentials: true 
          });
          break;
        case 'income':
          response = await axios.delete(`${BASE_URL}/api/auth/delete-all-income`, { 
            data: { password },
            withCredentials: true 
          });
          break;
        case 'bills':
          response = await axios.delete(`${BASE_URL}/api/auth/delete-all-bills`, { 
            data: { password },
            withCredentials: true 
          });
          break;
        case 'budgets':
          response = await axios.delete(`${BASE_URL}/api/auth/delete-all-budgets`, { 
            data: { password },
            withCredentials: true 
          });
          break;
        case 'categories':
          response = await axios.delete(`${BASE_URL}/api/auth/delete-all-categories`, { 
            data: { password },
            withCredentials: true 
          });
          break;
        case 'transactions':
          response = await axios.delete(`${BASE_URL}/api/auth/delete-all-transactions`, { 
            data: { password },
            withCredentials: true 
          });
          break;
        case 'devices':
          response = await axios.delete(`${BASE_URL}/api/auth/delete-all-devices`, { 
            data: { password },
            withCredentials: true 
          });
          break;
        case 'account':
          response = await axios.delete(`${BASE_URL}/api/auth//delete-account`, { 
            data: { password },
            withCredentials: true 
          });
          
          // If account deletion successful, redirect to logout
          if (response.status === 200) {
            toast.success('Account deleted successfully. Logging out in 2 sec...');
            setTimeout(() => {
              handleProfileAction("logout");
            }, 2000);
          }
          break;
        default:
          throw new Error('Invalid deletion type');
      }
      
      // Set success message based on the response or use a default
      setSuccessMessage(response.data.message || `All ${confirmationType} have been successfully deleted.`);
      setShowSuccessNotification(true);
      
      // Hide success notification after 5 seconds
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error during deletion:', error);
      alert(`Failed to delete ${confirmationType}. ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      // Close modal and reset states
      fetchUserData();
      setShowSecondConfirmModal(false);
      setConfirmText('');
      setPassword('');
    }
  };

  // Fetch user's bug reports on component mount
  useEffect(() => {
    fetchUserBugReports();
  }, []);

  const fetchUserBugReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/auth/user-report-bug`);
      
      if (response.data.success) {
        setBugReports(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch bug reports');
      }
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      toast.error('Error fetching bug reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Profile picture edit state
  const [isEditingPic, setIsEditingPic] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const cancelUpload = () => {
    setPreviewImage(null);
    setIsEditingPic(false);
  };

  const saveProfilePic = async () => {
    if (!previewImage) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      // Convert base64 to blob
      const response = await fetch(previewImage);
      const blob = await response.blob();
      formData.append('profilePic', blob, 'profile-pic.jpg');
      
      const res = await fetch(`${backendUrl}/api/auth/update-profile-pic`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update user data with new image
        setUserData({
          ...userData,
          image: previewImage
        });
        setIsEditingPic(false);
      } else {
        console.error('Error updating profile picture:', data.message);
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      // You might want to show an error toast here
    } finally {
      setIsUploading(false);
    }
  };

  const toggleExpand = (reportId) => {
    if (expandedReport === reportId) {
      setExpandedReport(null);
    } else {
      setExpandedReport(reportId);
    }
  };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

const fetchUserData = async () => {
          try {
              setLoading(true);
              const response = await axios.get(
                  `${import.meta.env.VITE_BACKEND_URL}/api/user/get-data`, // Adjust based on your auth setup
                  { withCredentials: true }
              );
              if (response.data.success) {
                const fetchedData = response.data.userData;
    
                const updatedUserData = {
                  ...fetchedData,
                  hasPassword: !!fetchedData.hasPassword, 
                };

                setUserData(updatedUserData);
                  setFormData({
                      onboardingData: {
                          employmentStatus: response.data.userData.onboardingData.employmentStatus || "",
                          yearlyIncome: response.data.userData.onboardingData.yearlyIncome || 0,
                          savingsGoal: response.data.userData.onboardingData.savingsGoal || 0,
                          riskLevel: response.data.userData.onboardingData.riskLevel || "Moderate",
                          monthlyBudgets: response.data.userData.onboardingData.monthlyBudgets || [],
                          financialGoals: response.data.userData.onboardingData.financialGoals || [],
                          financialHabits: response.data.userData.onboardingData.financialHabits || [],
                          isCurrentlyInvesting:
                              response.data.userData.onboardingData.isCurrentlyInvesting || false,
                          investmentTypes: response.data.userData.onboardingData.investmentTypes || [],
                      },
                  });
                  setUserData(response.data.userData); // No need to map, backend handles it
                  setFormData(response.data.userData);
                  setOriginalData({
                      onboardingData: {
                          employmentStatus: response.data.userData.onboardingData.employmentStatus || "",
                          yearlyIncome: response.data.userData.onboardingData.yearlyIncome || 0,
                          savingsGoal: response.data.userData.onboardingData.savingsGoal || 0,
                          riskLevel: response.data.userData.onboardingData.riskLevel || "Moderate",
                          monthlyBudgets: response.data.userData.onboardingData.monthlyBudgets || [],
                          financialGoals: response.data.userData.onboardingData.financialGoals || [],
                          financialHabits: response.data.userData.onboardingData.financialHabits || [],
                          isCurrentlyInvesting:
                              response.data.userData.onboardingData.isCurrentlyInvesting || false,
                          investmentTypes: response.data.userData.onboardingData.investmentTypes || [],
                      },
                  });
              } else {
                  console.error("Failed to fetch user data:", response.data.message);
              }
          } catch (error) {
              console.error("Error fetching user data:", error.message);
          } finally {
              setLoading(false);
          }
      };

  useEffect(() => {
      
      fetchUserData();
  }, []);

  // Handle save finance data
  const handleSaveFinance = async () => {
      try {
          setLoading(true);
          const response = await axios.put(
              `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-financial-profile`,
              { onboardingData: formData.onboardingData },
              { withCredentials: true }
          );
          if (response.data.success) {
              setUserData({
                  ...userData,
                  onboardingData: formData.onboardingData,
              });
              setOriginalData({ ...formData });
              setEditingSection(null);
              toast.success("Financial profile updated successfully");
          } else {
              console.error("Failed to update financial profile:", response.data.message);
          }
      } catch (error) {
          console.error("Error updating financial profile:", error.message);
      } finally {
          setLoading(false);
      }
  };

  const sendVerificationOtp = async () => {
    // If already loading, prevent additional clicks
    if (isVerificationLoading) {
      toast.info("Verification email is being sent, please wait...");
      return;
    }
    
    try {
      // Set loading state to true
      setIsVerificationLoading(true);
      
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
      
      if (data.success) {
        navigate('/verify-email');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      // Set loading state back to false after completion
      setIsVerificationLoading(false);
    }
  };

  const handleProfileAction = (action) => {
    if (action === "logout") {
      // Handle logout logic here
      // console.log("Logging out...");
      logout();
      navigate("/");
    }
  };

  const logout = async()=>{
    try{
      axios.defaults.withCredentials=true;
      const{data} = await axios.post(`${BASE_URL}/api/auth/logout`);
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      localStorage.removeItem('user-info');
      toast.success(data.message)
      navigate('/')
    }
    catch(error){
      toast.error(error.message);
    }
  };

  // Function to update user data
  const updateUserData = async (updatedData) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/auth/update-profile`, updatedData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Update user data error:", error);
      toast.error("Error updating profile");
      return false;
    }
  };

  const handleDragEnd = async (result, categoryType) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;
  
    const categories = categoryType === 'income'
      ? [...userData.onboardingData.customIncomeCategories]
      : [...userData.onboardingData.customExpenseCategories];
  
    const [reorderedItem] = categories.splice(source.index, 1);
    categories.splice(destination.index, 0, reorderedItem);
  

    try {
      setUserData(prev => ({
        ...prev,
        onboardingData: {
          ...prev.onboardingData,
          [categoryType === 'income' ? 'customIncomeCategories' : 'customExpenseCategories']: categories
        }
      }));
      await CategoryAPI.updateCategoryOrder(categoryType, categories);
    } catch (error) {
      setError(error.message);
      setUserData(prev => prev);
    }
  };

  const renderCategoryItem = (category, index, categoryType) => {
    if (!category._id) {
      console.error('Category missing _id:', category);
      return (
        <div key={`${categoryType}-${category.name}-${index}`} className="p-3 text-red-500 flex items-center justify-between">
          <span>Error: Invalid category "{category.name}" (missing ID)</span>
          <span className="text-xs">Contact support to fix</span>
        </div>
      );
    }

    const categoryId = category._id.toString();

    return (
      <Draggable key={categoryId} draggableId={categoryId} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              snapshot.isDragging ? 'bg-blue-50 shadow-md' : 'bg-white hover:bg-gray-50'
            } transition-all duration-200`}
          >
            <div className="flex items-center">
              <GripVertical className="mr-3 text-gray-400" size={16} />
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  categoryType === 'income' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-700">{category.name}</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  setEditingCategory({ type: categoryType, id: categoryId, name: category.name });
                  setEditingSection('editCategory');
                  setCategoryOptions(
                    categoryType === 'income' ? incomeSourceOptions : expenseCategoryOptions
                  );
                }}
                className="p-1 text-gray-500 hover:text-blue-500 mr-1"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={async () => {
                  try {
                    await CategoryAPI.deleteCategory(categoryType, categoryId);
                    setUserData((prev) => ({
                      ...prev,
                      onboardingData: {
                        ...prev.onboardingData,
                        [categoryType === 'income' ? 'customIncomeCategories' : 'customExpenseCategories']:
                          prev.onboardingData[
                            categoryType === 'income'
                              ? 'customIncomeCategories'
                              : 'customExpenseCategories'
                          ].filter((cat) => cat._id !== categoryId),
                      },
                    }));
                    toast.success('Category deleted successfully');
                  } catch (error) {
                    console.error('Error deleting category:', error);
                    setError(error.message);
                    toast.error(error.message || 'Failed to delete category');
                  }
                }}
                className="p-1 text-gray-500 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const renderEmailVerificationBanner = () => {
    if (userData.isAccountVerified) return null;
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Your email address has not been verified. Please verify your email to access all features.</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => {
                  sendVerificationOtp();
                }}
                disabled={isVerificationLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {isVerificationLoading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} className="mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>
              <button 
                onClick={() => {
                  sendVerificationOtp();
                }}
                disabled={isVerificationLoading}
                className="inline-flex items-center px-4 py-2 border border-yellow-600 text-sm font-medium rounded-md shadow-sm text-yellow-600 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {isVerificationLoading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Redirecting ...
                  </>
                ) : (
                  <>
                    <Mail size={16} className="mr-2" />
                    Go to Verification Page
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleInputChangeAge = (e) => {
    const { name, value } = e.target;
    
    // Prevents leading zeros and restricts input to numbers only
    const sanitizedValue = value.replace(/^0+/, '');
  
    // Restrict to numbers between 1-99
    if (!isNaN(sanitizedValue) && sanitizedValue >= 1 && sanitizedValue <= 99) {
      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue
      }));
    }
  };

  const handleSave = async () => {
    const success = await updateUserData(formData);
    if (success) {
      setUserData({...formData});
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({...userData});
    setIsEditing(false);
  };

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BASE_URL}/api/auth/check-premium-status`);
      if (response.data.success) {
        // Update user data with subscription info
        setUserData(prevData => ({
          ...prevData,
          isPremium: response.data.isPremium,
          subscriptionType: response.data.subscriptionType || 'monthly',
          subscriptionEndDate: response.data.subscriptionEndDate,
          daysRemaining: response.data.daysRemaining || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  // First, let's add a function to fetch transaction history from expenses
  const fetchSubscriptionHistory = async () => {
    try {
      // Assuming you have an API endpoint to fetch expenses
      const response = await axios.get(`${BASE_URL}/api/auth/get-payment`);
      // Map to the format needed for the billing history table
      // return subscriptionHistory.map(expense => ({
      //   date: expense.date,
      //   amount: expense.amount,
      //   status: 'Paid', // Since these are recorded expenses, they're assumed paid
      //   id: expense._id, // Assuming your expense objects have IDs
      //   description: expense.description
      // }));
      if(response.data.success) return response.data.payments;
      else {
        toast.error(response.data.message || 'Failed to fetch subscription history');
      console.log(response.data);
    }
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }
  };

// Add this to your component initialization (useEffect)
  useEffect(() => {
    const loadData = async () => {
      if (userData && userData.isPremium) {
        const history = await fetchSubscriptionHistory();
        setUserData(prevData => ({...prevData, billingHistory: history}));
      }
    };
    loadData();
  }, [userData?.isPremium]);

  // Modify the download invoice function to generate a PDF
  const downloadInvoice = (paymentId) => {
    // Find the specific payment record
    const payment = userData.billingHistory.find(item => item.id === paymentId);
    
    if (!payment) {
      toast.error('Invoice not found');
      return;
    }
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      
      // Helper function to draw a line
      const drawLine = (y) => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
      };
      
      // Helper function for creating a simple table
      const createTable = (headers, rows, startY) => {
        const colWidth = (pageWidth - 2 * margin) / headers.length;
        let y = startY;
        
        // Headers
        doc.setFillColor(44, 62, 80);
        doc.setDrawColor(44, 62, 80);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
        
        headers.forEach((header, i) => {
          doc.text(header, margin + (i * colWidth) + 5, y + 7);
        });
        y += 10;
        
        // Rows
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        rows.forEach((row, rowIndex) => {
          // Alternate row background for better readability
          if (rowIndex % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
          }
          
          row.forEach((cell, i) => {
            // Right-align the amount column
            if (i === headers.length - 1) {
              doc.text(cell, (margin + ((i + 1) * colWidth)) - 5, y + 7, { align: 'right' });
            } else {
              doc.text(cell, margin + (i * colWidth) + 5, y + 7);
            }
          });
          y += 10;
        });
        
        return y; // Return the new Y position
      };
      
      // Add company logo/header
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('AI Finance Pro', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('RECEIPT', pageWidth / 2, 32, { align: 'center' });
      
      // Add receipt number and date in top corners
      doc.setFontSize(10);
      doc.text(`Receipt #: ${payment.id.substring(0, 8)}`, margin, 50);
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })}`, pageWidth - margin, 50, { align: 'right' });
      
      // Add billing and subscription info
      let y = 70;
      
      // Two-column layout for customer and payment info
      const colWidth = (pageWidth - (2 * margin)) / 2;
      
      // Left column - Customer info
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Customer Information', margin, y);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Name: ${userData.name || 'User'}`, margin, y + 10);
      doc.text(`Email: ${userData.email || 'Not provided'}`, margin, y + 20);
      
      // Right column - Payment info
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Information', margin + colWidth, y);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Method: ${payment.paymentMethod || 'Online Payment'}`, margin + colWidth, y + 10);
      doc.text(`Status: ${payment.status}`, margin + colWidth, y + 20);
      doc.text(`Transaction ID: ${payment.paymentId || 'N/A'}`, margin + colWidth, y + 30);
      doc.text(`Order ID: ${payment.orderId || 'N/A'}`, margin + colWidth, y + 40);
      
      // Subscription details
      y += 60;
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Subscription Details', margin, y);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      doc.text(`Plan: ${payment.plan || 'Premium'}`, margin, y + 10);
      
      // Format subscription date range
      const startDate = payment.subscriptionPeriod?.start ? 
        new Date(payment.subscriptionPeriod.start).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'N/A';
      
      const endDate = payment.subscriptionPeriod?.end ? 
        new Date(payment.subscriptionPeriod.end).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'N/A';
      
      doc.text(`Period: ${startDate} to ${endDate}`, margin, y + 20);
      
      // Draw line above invoice items
      drawLine(y + 35);
      
      // Invoice items table
      y += 45;
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Invoice Items', margin, y);
      y += 10;
      
      // Create table headers and rows
      const headers = ['Description', 'Amount'];
      
      // Handle potential undefined values
      const processingFee = payment.fee ? (payment.fee/100).toFixed(2) : '0.00';
      const taxAmount = payment.tax ? (payment.tax/100).toFixed(2) : '0.00';
      const currency = payment.currency || '$';
      const discount = (payment.tax + payment.fee)/100;

      const rows = [
        ['Subscription Fee', `${currency} ${payment.amount}`],
        ['Processing Fee', `${currency} ${processingFee}`],
        ['Tax', `${currency} ${taxAmount}`],
        ['Discount', `- ${currency} ${discount}`],
      ];
      
      // Calculate the total
      const total = (
        parseFloat(payment.amount)
      ).toFixed(2);
      
      // Call custom table function
      let tableEndY = createTable(headers, rows, y);
      
      // Add total
      tableEndY += 6;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Total:', pageWidth - margin - 80, tableEndY);
      doc.text(`${currency} ${total}`, pageWidth - margin-5, tableEndY, { align: 'right' });
      
      // Add footer
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      drawLine(pageHeight - 30);
      doc.text('Thank you for your subscription to AI Finance Pro.', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text('For any questions, please contact support@aifinancepro.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save the PDF
      doc.save(`AI-Finance-Pro-Invoice-${payment.id.substring(0, 8)}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF receipt:', error);
      toast.error('Failed to generate receipt PDF');
      
      // Fallback to text receipt if PDF generation fails
      try {
        const receiptText = `
  ===========================================
                AI FINANCE PRO
                  RECEIPT
  ===========================================
  Receipt #: ${payment.id.substring(0, 8)}
  Date: ${new Date().toLocaleDateString()}

  CUSTOMER INFORMATION
  -------------------
  Name: ${userData.name || 'User'}
  Email: ${userData.email || 'Not provided'}

  PAYMENT INFORMATION
  ------------------
  Method: ${payment.paymentMethod || 'Online Payment'}
  Status: ${payment.status}
  Transaction ID: ${payment.paymentId || 'N/A'}
  Order ID: ${payment.orderId || 'N/A'}

  SUBSCRIPTION DETAILS
  -------------------
  Plan: ${payment.plan || 'Premium'}
  Start Date: ${payment.subscriptionPeriod?.start ? new Date(payment.subscriptionPeriod.start).toLocaleDateString() : 'N/A'}
  End Date: ${payment.subscriptionPeriod?.end ? new Date(payment.subscriptionPeriod.end).toLocaleDateString() : 'N/A'}

  INVOICE ITEMS
  ------------
  Subscription Fee:  ${payment.currency || '$'} ${payment.amount}
  Processing Fee:    ${payment.currency || '$'} ${(payment.fee/100).toFixed(2) || '0.00'}
  Tax:               ${payment.currency || '$'} ${(payment.tax/100).toFixed(2) || '0.00'}
                    ----------
  TOTAL:             ${payment.currency || '$'} ${(
          parseFloat(payment.amount) + 
          parseFloat((payment.fee/100).toFixed(2) || 0) + 
          parseFloat((payment.tax/100).toFixed(2) || 0)
        ).toFixed(2)}

  ===========================================
  Thank you for your subscription to AI Finance Pro.
  For any questions, please contact support@aifinancepro.com
  ===========================================
  `;
        
        // Create a blob and download it
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI-Finance-Pro-Receipt-${payment.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (fallbackError) {
        console.error('Even text fallback failed:', fallbackError);
        toast.error('Could not generate receipt in any format. Please contact support.');
      }
    }
  };
 
  const confirmCancellation = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/api/auth/cancel-subscription`);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Subscription canceled successfully');
        setShowCancelConfirm(false);
        await fetchSubscriptionData(); // Refresh data
      } else {
        toast.error(response.data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = () => {
    // Implement payment update flow - could open a modal or redirect to payment page
    toast.info('Payment update feature will be available soon');
  };
  

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderProfileContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span>Loading...</span>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-xl font-medium text-gray-700">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
  
    if (!userData) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-xl font-medium text-gray-700">No user data available</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    
  if (activeTab === 'profile') {
    return (
      <div className="w-full">
        {renderEmailVerificationBanner()}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <Edit3 size={16} className="mr-1" /> Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                    {userData.isAccountVerified ? (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <Check size={16} />
                      </span>
                    ) : (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500">
                        <AlertCircle size={16} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChangeAge}
                    min={1}
                    max={99}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-gray-800">{userData.name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="text-gray-500 mr-3" size={18} />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500">Email</p>
                    <div className="flex items-center">
                      <p className="text-gray-800">{userData.email}</p>
                      {userData.isAccountVerified ? (
                        <span className="ml-2 text-green-500 flex items-center">
                          <Check size={16} className="mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="ml-2 text-yellow-500 flex items-center">
                          <AlertCircle size={16} className="mr-1" /> Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    {userData.age ? (
                      <p className="text-gray-800">{userData.age} years</p>
                    ) : (
                      <p className="text-gray-400 italic">Not set</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {userData.phone ? (
                      <p className="text-gray-800">{userData.phone}</p>
                    ) : (
                      <p className="text-gray-400 italic">Not set</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    {userData.address ? (
                      <p className="text-gray-800">{userData.address}</p>
                    ) : (
                      <p className="text-gray-400 italic">Not set</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Account Updated</p>
                    <p className="text-gray-800">{formatDate(userData.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="text-gray-800">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Account Management</h2>
            <div className="space-y-4">
            <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="text-gray-500 mr-3" size={18} />
                    <div>
                      <p className="text-gray-800">{userData.hasPassword ? 'Change Password' : 'Create Password'}</p>
                      <p className="text-sm text-gray-500">
                        Last changed: {formatDistanceToNow(new Date(userData?.lastPasswordChange || Date.now()), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                        setPasswordModal({
                            isOpen: true,
                            // Conditionally set the mode based on whether the user has a password
                            mode: userData.hasPassword ? 'change' : 'set',
                        });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {/* UPDATED: Change button text for clarity */}
                    {userData.hasPassword ? 'Change' : 'Create Password'}
                </button>
                </div>
            
              {/* <button className="flex items-center text-red-500 hover:text-red-700" onClick={() => handleProfileAction("logout")}>
                <LogOut className="mr-2" size={16} /> Log Out
              </button> */}
              <div className="flex items-center justify-between cursor-pointer hover:text-red-700" onClick={() => handleProfileAction("logout")}>
                  <div className="flex items-center hover:text-red-700">
                    <LogOut className="text-red-500 hover:text-red-700 mr-3" size={18} />
                    <div>
                      <p className="text-red-500 hover:text-red-700">Logout</p>
                      <p className="text-sm text-red-500 hover:text-red-700">
                        Current LoggedIn: {formatDistanceToNow(new Date(userData?.lastLogin || Date.now()), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              {/* <button className="flex items-center text-red-500 hover:text-red-700">
                <Trash2 className="mr-2" size={16} /> Delete Account
              </button> */}
            </div>
          </div>
        </div>
        {passwordModal.isOpen && (
            <PasswordModal
                mode={passwordModal.mode}
                onClose={() => setPasswordModal({ isOpen: false, mode: 'change' })}
                onSuccess={() => {
                    fetchUserData(); 
                }}
            />
        )}
      </div>
    );
  }
  else if (activeTab === "finance") {
    return (
      <div className="w-full">
        {!userData?.isOnboardingComplete ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-xl font-medium text-gray-700">Please Complete Onboarding!</p>
              <button
                onClick={() => navigate("/onboarding")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Click here for Onboarding
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading financial data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs within Finance */}
            <div className="flex border-b">
              {["financialProfile", "monthlyBudgets", "investments", "financialGoals", "financialHabits"].map((section) => (
                <button
                  key={section}
                  className={`px-4 py-2 ${
                    editingSection === section || (!editingSection && section === "financialProfile")
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={() => setEditingSection(section)}
                >
                  {section
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Financial Profile Section */}
            {(!editingSection || editingSection === "financialProfile") && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl font-bold">Financial Profile</h2>
                    {editingSection !== "financialProfile" ? (
                      <button
                        onClick={() => {
                          setEditingSection("financialProfile");
                          setOriginalData({ ...formData });
                        }}
                        className="flex items-center text-blue-500 hover:text-blue-700 mt-2 sm:mt-0"
                      >
                        <Edit3 size={16} className="mr-1" /> Edit
                      </button>
                    ) : (
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                        <button
                          onClick={handleSaveFinance}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                        >
                          <Save size={16} className="mr-1" /> Save
                        </button>
                        <button
                          onClick={() => {
                            setFormData({ ...originalData });
                            setEditingSection(null);
                          }}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 flex items-center"
                        >
                          <X size={16} className="mr-1" /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {editingSection === "financialProfile" ? (
                    <div className="space-y-6">
                      {/* Employment Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Employment Status
                        </label>
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                          >
                            {employmentOptions.map((option) => (
                              <motion.div
                                key={option}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (formData.onboardingData?.employmentStatus !== option) {
                                    setFormData({
                                      ...formData,
                                      onboardingData: {
                                        ...formData.onboardingData,
                                        employmentStatus: option,
                                      },
                                    });
                                  }
                                }}
                                className={`cursor-pointer p-4 border-2 rounded-xl text-center ${
                                  formData.onboardingData?.employmentStatus === option
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <p className="font-medium">{option}</p>
                              </motion.div>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Yearly Income */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Yearly Income (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.onboardingData?.yearlyIncome ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              onboardingData: {
                                ...formData.onboardingData,
                                yearlyIncome:
                                  e.target.value === "" ? 0 : Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>

                      {/* Savings Goal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Savings Goal (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.onboardingData?.savingsGoal ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              onboardingData: {
                                ...formData.onboardingData,
                                savingsGoal:
                                  e.target.value === "" ? 0 : Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>

                      {/* Risk Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Risk Level
                        </label>
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-3 gap-4"
                          >
                            {riskLevelOptions.map((option) => (
                              <motion.div
                                key={option}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (formData.onboardingData?.riskLevel !== option) {
                                    setFormData({
                                      ...formData,
                                      onboardingData: {
                                        ...formData.onboardingData,
                                        riskLevel: option,
                                      },
                                    });
                                  }
                                }}
                                className={`cursor-pointer p-4 border-2 rounded-xl text-center ${
                                  formData.onboardingData?.riskLevel === option
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <p className="font-medium">{option}</p>
                              </motion.div>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userData.onboardingData.employmentStatus && (
                        <div className="flex items-center">
                          <ReceiptIndianRupee className="text-gray-500 mr-3" size={18} />
                          <div>
                            <p className="text-sm text-gray-500">Employment Status</p>
                            <p className="text-gray-800">{userData.onboardingData.employmentStatus}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <IndianRupee className="text-gray-500 mr-3" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">Yearly Income</p>
                          <p className="text-gray-800">
                            {Number(userData.onboardingData.yearlyIncome).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <IndianRupee className="text-gray-500 mr-3" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">Savings Goal</p>
                          <p className="text-gray-800">
                            {Number(userData.onboardingData.savingsGoal).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      {userData.onboardingData.riskLevel && (
                        <div className="flex items-start">
                          <ShieldAlertIcon className="text-gray-500 mr-3 mt-1" size={18} />
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                            <div className="flex items-center">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                  userData.onboardingData.riskLevel === "High"
                                    ? "bg-red-500"
                                    : userData.onboardingData.riskLevel === "Moderate"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              ></span>
                              <p className="text-gray-800 font-medium">
                                {userData.onboardingData.riskLevel}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Monthly Budgets Section (Unchanged) */}
            {editingSection === "monthlyBudgets" && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl font-bold">Monthly Budgets ({currentYear})</h2>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={handleSaveFinance}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                      >
                        <Save size={16} className="mr-1" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setFormData({ ...originalData });
                          setEditingSection(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 flex items-center"
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {months.map((month, index) => {
                      const budget =
                        formData.onboardingData.monthlyBudgets?.find(
                          (b) => b.month === index + 1 && b.year === currentYear
                        ) || { amount: "" };
                      return (
                        <div key={index} className="flex items-center">
                          <IndianRupee className="text-gray-500 mr-3" size={18} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">{month}</p>
                            <input
                              type="number"
                              value={budget.amount}
                              onChange={(e) => {
                                const newBudgets = [
                                  ...(formData.onboardingData.monthlyBudgets || []),
                                ];
                                const budgetIndex = newBudgets.findIndex(
                                  (b) => b.month === index + 1 && b.year === currentYear
                                );
                                if (budgetIndex !== -1) {
                                  newBudgets[budgetIndex] = {
                                    ...newBudgets[budgetIndex],
                                    amount:
                                      e.target.value === "" ? "" : Number(e.target.value),
                                  };
                                } else {
                                  newBudgets.push({
                                    month: index + 1,
                                    year: currentYear,
                                    amount:
                                      e.target.value === "" ? "" : Number(e.target.value),
                                  });
                                }
                                setFormData({
                                  ...formData,
                                  onboardingData: {
                                    ...formData.onboardingData,
                                    monthlyBudgets: newBudgets,
                                  },
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Investments Section */}
            {editingSection === "investments" && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl font-bold">Investments</h2>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={handleSaveFinance}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                      >
                        <Save size={16} className="mr-1" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setFormData({ ...originalData });
                          setEditingSection(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 flex items-center"
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.onboardingData?.isCurrentlyInvesting || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            onboardingData: {
                              ...formData.onboardingData,
                              isCurrentlyInvesting: e.target.checked,
                              investmentTypes: e.target.checked
                                ? formData.onboardingData?.investmentTypes || []
                                : [],
                            },
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Currently Investing
                      </label>
                    </div>

                    {formData.onboardingData?.isCurrentlyInvesting && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Investment Types (Select all that apply)
                        </label>
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                          >
                            {investmentTypeOptions.map((type) => (
                              <motion.div
                                key={type}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const currentTypes =
                                    formData.onboardingData?.investmentTypes || [];
                                  const newTypes = currentTypes.includes(type)
                                    ? currentTypes.filter((t) => t !== type)
                                    : [...currentTypes, type];
                                  setFormData({
                                    ...formData,
                                    onboardingData: {
                                      ...formData.onboardingData,
                                      investmentTypes: newTypes,
                                    },
                                  });
                                }}
                                className={`cursor-pointer p-4 border-2 rounded-xl flex justify-between items-center ${
                                  formData.onboardingData?.investmentTypes?.includes(type)
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <span className="font-medium">{type}</span>
                                {formData.onboardingData?.investmentTypes?.includes(type) && (
                                  <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    ></path>
                                  </svg>
                                )}
                              </motion.div>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Financial Goals Section */}
            {editingSection === "financialGoals" && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl font-bold">Financial Goals</h2>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={handleSaveFinance}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                      >
                        <Save size={16} className="mr-1" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setFormData({ ...originalData });
                          setEditingSection(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 flex items-center"
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Financial Goals (Select all that apply)
                    </label>
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                      >
                        {financialGoalOptions.map((goal) => (
                          <motion.div
                            key={goal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const currentGoals =
                                formData.onboardingData?.financialGoals || [];
                              const newGoals = currentGoals.includes(goal)
                                ? currentGoals.filter((g) => g !== goal)
                                : [...currentGoals, goal];
                              setFormData({
                                ...formData,
                                onboardingData: {
                                  ...formData.onboardingData,
                                  financialGoals: newGoals,
                                },
                              });
                            }}
                            className={`cursor-pointer p-4 border-2 rounded-xl flex justify-between items-center ${
                              formData.onboardingData?.financialGoals?.includes(goal)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="font-medium">{goal}</span>
                            {formData.onboardingData?.financialGoals?.includes(goal) && (
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Habits Section */}
            {editingSection === "financialHabits" && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl font-bold">Financial Habits</h2>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={handleSaveFinance}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                      >
                        <Save size={16} className="mr-1" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setFormData({ ...originalData });
                          setEditingSection(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 flex items-center"
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Financial Habits (Select all that apply)
                    </label>
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                      >
                        {financialHabitsOptions.map((habit) => (
                          <motion.div
                            key={habit}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const currentHabits =
                                formData.onboardingData?.financialHabits || [];
                              const newHabits = currentHabits.includes(habit)
                                ? currentHabits.filter((h) => h !== habit)
                                : [...currentHabits, habit];
                              setFormData({
                                ...formData,
                                onboardingData: {
                                  ...formData.onboardingData,
                                  financialHabits: newHabits,
                                },
                              });
                            }}
                            className={`cursor-pointer p-4 border-2 rounded-xl flex justify-between items-center ${
                              formData.onboardingData?.financialHabits?.includes(habit)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="font-medium">{habit}</span>
                            {formData.onboardingData?.financialHabits?.includes(habit) && (
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  else if (activeTab === 'category') {
    return (
      <>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Custom Categories</h2>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <ArrowUpCircle className="mr-2 text-green-500" size={20} />
                  Income Categories
                </h3>
                <button
                  onClick={() => {
                    setEditingSection('addIncomeCategory');
                    setEditingCategory(null);
                    setCategoryOptions(incomeSourceOptions);
                  }}
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <PlusCircle size={16} className="mr-1" /> Add Category
                </button>
              </div>
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'income')}>
                <Droppable droppableId="incomeCategories">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {userData.onboardingData.customIncomeCategories.map((category, index) =>
                        renderCategoryItem(category, index, 'income')
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <ArrowDownCircle className="mr-2 text-red-500" size={20} />
                  Expense Categories
                </h3>
                <button
                  onClick={() => {
                    setEditingSection('addExpenseCategory');
                    setEditingCategory(null);
                    setCategoryOptions(expenseCategoryOptions);
                  }}
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <PlusCircle size={16} className="mr-1" /> Add Category
                </button>
              </div>
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'expense')}>
                <Droppable droppableId="expenseCategories">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {userData.onboardingData.customExpenseCategories.map((category, index) =>
                        renderCategoryItem(category, index, 'expense')
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>

        {(editingSection === 'addIncomeCategory' ||
          editingSection === 'addExpenseCategory' ||
          editingSection === 'editCategory') && (
          <CategoryForm
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            categoryType={
              editingSection === 'addIncomeCategory' || editingCategory?.type === 'income'
                ? 'income'
                : 'expense'
            }
            editingCategory={editingCategory}
            setUserData={setUserData}
            setError={setError}
            categoryOptions={categoryOptions}
            userData={userData} // Pass userData for duplicate checking
            onClose={() => setEditingSection(null)} // Close handler
          />
        )}
      </>
    );
  }
  else if (activeTab === 'security') {
    return (
      <div className="w-full">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              {/* <div>
                <h3 className="text-md font-semibold mb-3">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="text-gray-500 mr-3" size={18} />
                    <div>
                      <p className="text-gray-800">Enable two-factor authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isTwoFactorEnabled}
                      onChange={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
                    />
                    <div className={`w-11 h-6 ${isTwoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              </div> */}
              
              {/* Login History */}
              <div>
                <h3 className="text-md font-semibold mb-3">Login History</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Authorization
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData?.loginHistory?.slice(-3).reverse().map((login, index) => (
                        <tr key={index} className={`${
                          login.isSuccessful ? "bg-green-100" : "bg-red-100"
                        }`} >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDistanceToNow(new Date(login.loginAt), { addSuffix: true })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {login.loginMethod || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {login.ipAddress || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {login.location 
                              ? `${login.location.city || ''}, ${login.location.region || ''}, ${login.location.country || ''}`.trim()
                              : 'Unknown Location'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Login History */}
              <div>
                <h3 className="text-md font-semibold mb-3">Devices</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device / Browser
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Operating System
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Used
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData?.deviceTokens?.slice(-3).reverse().map((device, index) => {
                        // Find the corresponding login history entry
                        const login = userData?.loginHistory
                          ?.slice(-3)
                          .reverse()
                          .find((entry) => entry.device === device.device);

                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {device.device === "Unknown Device" ? "Unknown" : device.device} 
                              {login ? (login.browser === "Unknown Browser" ? " / Unknown" : " / " + login.browser) : " / Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {login?.operatingSystem || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device ? formatDate(device.lastUsed) : 'Unknown'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
                </div>
              </div>

              {/* Password Security */}
              <div>
                <h3 className="text-md font-semibold mb-3">Password Security</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="text-gray-500 mr-3" size={18} />
                    <div>
                      <p className="text-gray-800">{userData.hasPassword ? 'Change Password' : 'Create Password'}</p>
                      <p className="text-sm text-gray-500">
                        Last changed: {formatDistanceToNow(new Date(userData?.lastPasswordChange || Date.now()), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button
        // UPDATED onClick handler
        onClick={() => {
            setPasswordModal({
                isOpen: true,
                // Conditionally set the mode based on whether the user has a password
                mode: userData.hasPassword ? 'change' : 'set',
            });
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
        {/* UPDATED: Change button text for clarity */}
        {userData.hasPassword ? 'Change' : 'Create Password'}
    </button>
                </div>
{showSecondConfirmModal && (
    <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
            {/* CONDITIONAL RENDER START */}
            {userData.hasPassword ? (
                // --- A) USER HAS A PASSWORD (Original Flow) ---
                <>
                    <p className="mb-4">
                        To confirm this action, please enter your password and type "{confirmationType === 'account' ? 'DELETE' : confirmationType}".
                    </p>
                    {/* Password Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>
                    {/* Confirmation Text Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type "{confirmationType === 'account' ? 'DELETE' : confirmationType}" to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder={`Type "${confirmationType === 'account' ? 'DELETE' : confirmationType}"`}
                        />
                    </div>
                     {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setShowSecondConfirmModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                        <button
                            onClick={handleSecondConfirmation}
                            // Original disabled logic
                            disabled={!password || (confirmText.toUpperCase() !== (confirmationType === 'account' ? 'DELETE' : confirmationType.toUpperCase()))}
                            className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
                        >
                            Confirm Deletion
                        </button>
                    </div>
                </>
            ) : (
                // --- B) USER DOES NOT HAVE A PASSWORD (New "Set & Proceed" Flow) ---
                <PasswordModal
                    mode="set"
                    onClose={() => setShowSecondConfirmModal(false)}
                    onSuccess={(newlySetPassword) => {
                        // This is the magic! On success, we get the new password
                        // and immediately call the original delete function with it.
                        toast.info('Password created. Now proceeding with deletion...');
                        
                        // Temporarily set the password in state to be used by the original function
                        setPassword(newlySetPassword);

                        // We need to use a useEffect or a callback to ensure state is set before calling the delete function
                        // A simple timeout works well here to allow React to update the state.
                        setTimeout(() => {
                           handleSecondConfirmation();
                        }, 100);
                    }}
                />
            )}
            {/* CONDITIONAL RENDER END */}
        </div>
    </div>
)}
              </div>
              
              {/* Notifications */}
              {/* <div>
                <h3 className="text-md font-semibold mb-3">Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="text-gray-500 mr-3" size={18} />
                    <div>
                      <p className="text-gray-800">Security Alerts</p>
                      <p className="text-sm text-gray-500">Get notified of any suspicious activity</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isSecurityAlertsEnabled}
                      onChange={() => setIsSecurityAlertsEnabled(!isSecurityAlertsEnabled)}
                    />
                    <div className={`w-11 h-6 ${isSecurityAlertsEnabled ? 'bg-blue-600' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        
      </div>
    );
  }
  else if (activeTab === 'preferences') {
    return (
      <div className="w-full">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        {/* Data Management Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Data Management</h2>
            
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-md font-semibold mb-2">Delete Financial Data</h3>
                <p className="text-sm text-gray-500 mb-4">Select what data you want to permanently delete from your account</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleDeleteConfirmation('expenses')}
                    className="flex items-center justify-between px-4 py-3 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    <div>
                      <p className="font-medium">Delete All Expenses</p>
                      <p className="text-sm text-gray-500">Remove all expense transactions</p>
                    </div>
                    <span className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteConfirmation('income')}
                    className="flex items-center justify-between px-4 py-3 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    <div>
                      <p className="font-medium">Delete All Income</p>
                      <p className="text-sm text-gray-500">Remove all income transactions</p>
                    </div>
                    <span className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteConfirmation('bills')}
                    className="flex items-center justify-between px-4 py-3 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    <div>
                      <p className="font-medium">Delete All Bills</p>
                      <p className="text-sm text-gray-500">Remove all bill records</p>
                    </div>
                    <span className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteConfirmation('budgets')}
                    className="flex items-center justify-between px-4 py-3 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    <div>
                      <p className="font-medium">Delete All Budgets</p>
                      <p className="text-sm text-gray-500">Remove all budget settings</p>
                    </div>
                    <span className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteConfirmation('categories')}
                    className="flex items-center justify-between px-4 py-3 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    <div>
                      <p className="font-medium">Delete Custom Categories</p>
                      <p className="text-sm text-gray-500">Remove all custom categories</p>
                    </div>
                    <span className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteConfirmation('transactions')}
                    className="flex items-center justify-between px-4 py-3 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    <div>
                      <p className="font-medium">Delete All Transactions</p>
                      <p className="text-sm text-gray-500">Remove all financial transactions</p>
                    </div>
                    <span className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="border-b pb-6">
                <h3 className="text-md font-semibold mb-2">Device Management</h3>
                <p className="text-sm text-gray-500 mb-4">Manage devices connected to your account</p>
                
                {userData?.deviceTokens?.slice(-3).reverse().map((device, index) => {
                  const loginn = userData?.loginHistory
                    ?.slice(-3)
                    .reverse()
                    .find((entry) => entry.device === device.device);

                  return (
                    <div key={index} className="p-4 m-5 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {device.device === "Unknown Device" ? "Unknown" : device.device}
                            {loginn
                              ? loginn.browser === "Unknown Browser"
                                ? " / Unknown"
                                : " / " + loginn.browser
                              : " / Unknown"}
                              {loginn?.operatingSystem ? " / " + loginn?.operatingSystem : '/ Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Last Used : {device ? formatDate(device.lastUsed) : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button 
                  onClick={() => handleDeleteConfirmation('devices')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Remove All Devices
                </button>
              </div>
              
              <div>
                <h3 className="text-md font-semibold mb-2 text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">These actions are permanent and cannot be undone</p>
                
                <button 
                  onClick={() => handleDeleteConfirmation('account')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* First confirmation modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 backdrop-blur-xl bg-opacity-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Confirm {confirmationType} Deletion</h3>
              <p className="mb-6">
                {confirmationMessages[confirmationType] || 
                `Are you sure you want to delete all ${confirmationType}? This action cannot be undone.`}
              </p>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFirstConfirmation}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Second confirmation modal with text input */}
          {showSecondConfirmModal && (
              <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-bold mb-4">Final Confirmation Required</h3>
                      
                      {/* CONDITIONAL RENDER START */}
                      {userData.hasPassword ? (
                          // --- A) USER HAS A PASSWORD (Original Flow) ---
                          <>
                              <p className="mb-4">
                                  To confirm this action, please enter your password and type "{confirmationType === 'account' ? 'DELETE' : confirmationType}".
                              </p>
                              {/* Password Input */}
                              <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Password</label>
                                  <input
                                      type="password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Enter your password"
                                  />
                              </div>
                              {/* Confirmation Text Input */}
                              <div className="mb-6">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Type "{confirmationType === 'account' ? 'DELETE' : confirmationType}" to confirm
                                  </label>
                                  <input
                                      type="text"
                                      value={confirmText}
                                      onChange={(e) => setConfirmText(e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                      placeholder={`Type "${confirmationType === 'account' ? 'DELETE' : confirmationType}"`}
                                  />
                              </div>
                              {/* Action Buttons */}
                              <div className="flex justify-end space-x-3">
                                  <button onClick={() => setShowSecondConfirmModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                                  <button
                                      onClick={handleSecondConfirmation}
                                      // Original disabled logic
                                      disabled={!password || (confirmText.toUpperCase() !== (confirmationType === 'account' ? 'DELETE' : confirmationType.toUpperCase()))}
                                      className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
                                  >
                                      Confirm Deletion
                                  </button>
                              </div>
                          </>
                      ) : (
                          // --- B) USER DOES NOT HAVE A PASSWORD (New "Set & Proceed" Flow) ---
                          <PasswordModal
                              mode="set"
                              onClose={() => setShowSecondConfirmModal(false)}
                              onSuccess={(newlySetPassword) => {
                                  // This is the magic! On success, we get the new password
                                  // and immediately call the original delete function with it.
                                  toast.info('Password created. Now proceeding with deletion...');
                                  
                                  // Temporarily set the password in state to be used by the original function
                                  setPassword(newlySetPassword);

                                  // We need to use a useEffect or a callback to ensure state is set before calling the delete function
                                  // A simple timeout works well here to allow React to update the state.
                                  setTimeout(() => {
                                    handleSecondConfirmation();
                                  }, 100);
                              }}
                          />
                      )}
                      {/* CONDITIONAL RENDER END */}
                  </div>
              </div>
          )}
        
        {/* Success notification */}
        {showSuccessNotification && (
          <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  {successMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button 
                    onClick={() => setShowSuccessNotification(false)} 
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    );
  }
  else if (activeTab === 'subscription') {
    return (
      <div className="w-full">
        {/* Current Subscription Status Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            {!userData.isPremium ? (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">No Active Subscription</h2>
                <span className="px-4 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Free Plan</span>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Current Subscription</h2>
                <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Premium</span>
              </div>
            )}
            
            {userData.isPremium && (
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Premium Plan</p>
                    <p className="text-sm text-gray-500 capitalize">{userData.subscriptionType || 'Monthly'}</p>
                  </div>
                  <p className="font-semibold">{userData.subscriptionType === 'annually' ? '₹10/year' : '₹1/month'}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Plan Type</p>
                  <p className="text-sm capitalize">{userData.subscriptionType}</p>
                </div>

                <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {userData.subscriptionType === "trial" ? "Trial End Date" : "Subscription End Date"}
                </p>
                <p className="text-sm">
                  {userData.subscriptionType === "trial"
                    ? new Date(userData.trialEndDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : new Date(userData.subscriptionEndDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </p>
                </div>
                
                <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    {userData.subscriptionType === "trial"
                      ? "Trial Days Remaining"
                      : "Subscription Days Remaining"}
                  </p>
                  <p className="text-sm">
                    {Math.max(
                      Math.ceil(
                        (new Date(
                          userData.subscriptionType === "trial"
                            ? userData.trialEndDate
                            : userData.subscriptionEndDate
                        ) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      ),
                      0
                    )}{" "}
                    days
                  </p>
                </div>
                
              </div>
            )}
            
            {userData.isPremium ? (
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <button 
                  onClick={() => handleUpdatePayment()} 
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition"
                >
                  Update Payment
                </button>
                <button 
                  onClick={() => setShowCancelConfirm(true)} 
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition"
                >
                  Cancel Subscription
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <button 
                  onClick={() => navigate('/upgrade')} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Upgrade to Premium
                </button>
                <button 
                  onClick={() => navigate('/upgrade')} 
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition"
                >
                  Start 7-Day Free Trial
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Subscription Benefits Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Premium Benefits</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-medium">Unlimited Transactions</p>
                  <p className="text-sm text-gray-500">Track all your financial activities without limits</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-medium">AI-Powered Insights</p>
                  <p className="text-sm text-gray-500">Get personalized financial recommendations</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-medium">Advanced Analytics</p>
                  <p className="text-sm text-gray-500">Detailed insights into your spending habits</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-medium">Premium Support</p>
                  <p className="text-sm text-gray-500">Priority customer service available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Billing History Card */}
        {userData && userData.isPremium && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Billing History</h2>
            
            <div className="border rounded-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {userData.billingHistory && userData.billingHistory.length > 0 ? (
                    userData.billingHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                              item.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                            <button onClick={() => downloadInvoice(item.id)} className="flex items-center">
                              <Download size={14} className="mr-1" /> Download
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan="4">
                          No billing history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Cancellation Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative border-2 border-red-200 shadow-xl m-4">
              <div className="flex items-center mb-4 text-red-600">
                <AlertCircle className="mr-2" size={24} />
                <h2 className="text-xl font-bold">Cancel Subscription?</h2>
              </div>
              
              <div className="mb-6 space-y-4">
                <p className="text-gray-700">Are you sure you want to cancel your Premium subscription?</p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Subscription type:</span> <span className="capitalize">{userData.subscriptionType}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Subscription ends on:</span> {userData.subscriptionEndDate ? new Date(userData.subscriptionEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not available'}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Days remaining:</span> {userData.daysRemaining || 0} days
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    If eligible, refunds will be processed within 7 business days.
                  </p>
                </div>
                
                <p className="text-sm text-gray-600">
                  Your access to premium features will continue until the end of your billing period.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-end">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition order-2 sm:order-1"
                  disabled={isLoading}
                >
                  Keep Subscription
                </button>
                <button 
                  onClick={confirmCancellation}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center order-1 sm:order-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  else if (activeTab === 'bug') {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Bug Reports</h1>
                <button
                  onClick={()=>navigate("/bug-report")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Report New Bug
                </button>
              </div>
              {bugReports.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't reported any bugs yet meaning the Website is very Perfect!.<p className='text-xs'>If No then Report, Sorry for Inconvience.</p></p>
                  <button
                    onClick={() => navigate('/bug-report')}
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Report Your First Bug
                  </button>
                </div>
              ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bugReports.map((report) => (
                        <React.Fragment key={report._id}>
                          <tr className={expandedReport === report._id ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 capitalize">{report.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${getPriorityColor(report.priority)}`}>
                                {report.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(report.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <button
                                onClick={() => toggleExpand(report._id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {expandedReport === report._id ? (
                                  <>
                                    <EyeOff size={16} className="mr-1" /> Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye size={16} className="mr-1" /> View
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedReport === report._id && (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 bg-blue-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="mb-4">
                                      <h3 className="font-semibold text-lg mb-3 text-gray-800">Description:</h3>
                                      <p className="text-gray-700 whitespace-pre-line">{report.description}</p>
                                    </div>
                                    
                                    {report.note && (
                                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-gray-800">Admin Response:</h3>
                                        <p className="text-gray-700 whitespace-pre-line">{report.note}</p>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                      <div className="bg-gray-50 p-3 rounded">
                                        <h3 className="font-semibold mb-1 text-gray-800">Device Info:</h3>
                                        <p className="text-gray-700 text-sm">{report.deviceInfo}</p>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded">
                                        <h3 className="font-semibold mb-1 text-gray-800">Browser Info:</h3>
                                        <p className="text-gray-700 text-sm">{report.browserInfo}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {report.screenshotUrl && (
                                    <div className="bg-white p-4 rounded-lg shadow">
                                      <h3 className="font-semibold text-lg mb-3 text-gray-800">Screenshot:</h3>
                                      <a href={report.screenshotUrl} target="_blank" rel="noopener noreferrer"
                                        className="block hover:opacity-90 transition-opacity">
                                        <img 
                                          src={report.screenshotUrl} 
                                          alt="Bug Screenshot" 
                                          className="max-w-full h-auto rounded-lg border border-gray-200"
                                        />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      );
}
  else if (activeTab === 'achievements') {
      return (
        <div className="w-full">
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Your Achievements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-4">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Budget Master</h3>
                    <p className="text-sm text-gray-500">Stayed under budget for 3 consecutive months</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-4">
                    <Star size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Saving Star</h3>
                    <p className="text-sm text-gray-500">Reached 50% of your savings goal</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center mr-4">
                    <Scissors size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Debt Destroyer</h3>
                    <p className="text-sm text-gray-500">Pay off all your debts</p>
                    <span className="text-xs text-yellow-500 mt-1 inline-block">In progress</span>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center opacity-50">
                  <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-4">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Investment Guru</h3>
                    <p className="text-sm text-gray-500">Start your first investment</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Your Stats</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-2xl font-bold text-blue-500">85%</h3>
                  <p className="text-sm text-gray-500">Budget Adherence</p>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-2xl font-bold text-green-500">$2,500</h3>
                  <p className="text-sm text-gray-500">Total Savings</p>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-2xl font-bold text-purple-500">12</h3>
                  <p className="text-sm text-gray-500">Months Active</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
                <div className="border rounded-lg p-4 h-64 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">Chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
};
  
    return (
        <>
        <Sidebar onToggle={setIsSidebarCollapsed} />
        <div className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'ml-14 ' : 'ml-60 max-w-full'}`}>
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your account and settings</p>
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row">
            <div className="md:w-72 flex-shrink-0 mb-6 md:mb-0">
              <div className="bg-white shadow-lg rounded-xl overflow-hidden sticky top-8">
              <div className="p-6 text-center bg-gradient-to-b from-blue-50 to-white">
      {/* Profile picture section with edit functionality */}
      <div className="relative inline-block">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md cursor-pointer"
            onClick={!isEditingPic ? () => setIsEditingPic(true) : undefined}>
          {previewImage ? (
            <img src={previewImage} className="h-full w-full object-cover" alt="Profile Preview" />
          ) : userData?.image ? (
            <img src={userData.image} className="h-full w-full object-cover" alt={userData.name ? userData.name.charAt(0).toUpperCase() : "U"} />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500 text-4xl font-semibold">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </div>
        
        {!isEditingPic ? (
          <button 
            onClick={() => setIsEditingPic(true)}
            className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-colors duration-200"
            title="Edit profile picture"
          >
            <Edit className="h-4 w-4" />
          </button>
        ) : (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white p-1 rounded-full shadow-md z-10">
            <button 
              onClick={triggerFileInput}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors duration-200"
              title="Upload new picture"
            >
              <Camera className="h-4 w-4" />
            </button>
            
            {previewImage && (
              <>
                <button 
                  onClick={cancelUpload}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={saveProfilePic}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-200"
                  disabled={isUploading}
                  title="Save"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              </>
            )}
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/jpg,image/webp"
          className="hidden"
        />
      </div>
      
      {error && (
        <div className="mt-4 text-sm text-red-500 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
      
      <h2 className="mt-8 font-semibold text-gray-900">{userData?.name || 'User'}</h2>
      <p className="text-sm text-gray-500">{userData?.email || ''}</p>
      <p className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
        {userData?.isPremium ? 'Premium User' : 'Free User'}
      </p>
    </div>
                
                <div className="border-t border-gray-200 p-2">
                  <nav className="flex flex-col space-y-1">
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === 'profile' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <User className={`mr-3 ${activeTab === 'profile' ? 'text-white' : 'text-blue-400'}`} size={18} />
                      Profile
                    </button>
                    <button 
                      onClick={() => setActiveTab('finance')}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === 'finance' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <DollarSign className={`mr-3 ${activeTab === 'finance' ? 'text-white' : 'text-blue-400'}`} size={18} />
                      Financial Info
                    </button>
                    <button 
                      onClick={() => setActiveTab('category')}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === 'category' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <FolderOpen className={`mr-3 ${activeTab === 'category' ? 'text-white' : 'text-blue-400'}`} size={18} />
                      Category
                    </button>
                    <button 
                      onClick={() => setActiveTab('security')}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === 'security' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Shield className={`mr-3 ${activeTab === 'security' ? 'text-white' : 'text-blue-400'}`} size={18} />
                      Security
                    </button>
                    <button 
                      onClick={() => setActiveTab('subscription')}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === 'subscription' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <CreditCard className={`mr-3 ${activeTab === 'subscription' ? 'text-white' : 'text-blue-400'}`} size={18} />
                      Subscription
                    </button>
                    <button 
                      onClick={() => setActiveTab('bug')}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === 'bug' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <BugIcon className={`mr-3 ${activeTab === 'bug' ? 'text-white' : 'text-blue-400'}`} size={18} />
                      Bugs
                    </button>
                    <button 
                      onClick={() => setActiveTab('preferences')}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === 'preferences' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Settings className={`mr-3 ${activeTab === 'preferences' ? 'text-white' : 'text-blue-400'}`} size={18} />
                      Settings
                    </button>
                    {userData?.isAdmin && (
                      <>
                        
                        <p className="text-sm font-medium text-gray-800 m-3">Admin Pages :</p>
                        <button 
                        onClick={() => navigate('/all-bugs')}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === 'contact-us' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <BugIcon className={`mr-3 ${activeTab === 'all-bugs' ? 'text-white' : 'text-blue-400'}`} size={18} />
                        All Bugs
                      </button>
                      </>
                    )}
                    {userData?.isAdmin && (
                      <button 
                        onClick={() => navigate('/all-contact-us')}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === 'contact-us' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <Contact className={`mr-3 ${activeTab === 'all-bugs' ? 'text-white' : 'text-blue-400'}`} size={18} />
                        All Contact Us
                      </button>
                    )}
                    {userData?.isAdmin && (
                      <button 
                        onClick={() => navigate('/all-reviews')}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === 'review-us' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <StarsIcon className={`mr-3 ${activeTab === 'all-bugs' ? 'text-white' : 'text-blue-400'}`} size={18} />
                        All Reviews
                      </button>
                    )}
                  </nav>
                </div>
              </div>
            </div>
            
            <div className="md:ml-6 flex-1">
              {renderProfileContent()}
            </div>
          </div>
        </div>
        </div>
        </>
      );
  };
  
  export default ProfilePage;