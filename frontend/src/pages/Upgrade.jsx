import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Sparkles, Brain, Activity, PieChart, Calendar, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useGlobalContext } from '../context/GlobalContext';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UpgradePage = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({
    subscriptionType: 'none',
    trialEndDate: null,
    subscriptionEndDate: null,
    daysRemaining: 0,
    hasUsedTrial: false
  });
  
  // Early bird offer state
  const [isEarlyBird, setIsEarlyBird] = useState(true);
  const [earlyBirdTimeLeft, setEarlyBirdTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const { 
    isPremium,
    subscriptionData,
    checkPremiumStatus,
    addExpense,
    userData
  } = useGlobalContext();

  useEffect(() => {
    fetchPremiumStatus();
    
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Early bird countdown timer
  useEffect(() => {
    // Set end date for early bird offer - example: 7 days from now
    const earlyBirdEndDate = new Date();
    earlyBirdEndDate.setDate(earlyBirdEndDate.getDate() + 30); // End date is 7 days from now
    
    const updateCountdown = () => {
      const now = new Date();
      const timeDifference = earlyBirdEndDate - now;
      
      // If time is up, end early bird offer
      if (timeDifference <= 0) {
        setIsEarlyBird(false);
        return;
      }
      
      // Calculate remaining time
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      
      setEarlyBirdTimeLeft({ days, hours, minutes, seconds });
    };
    
    // Update the countdown every second
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(countdownInterval);
  }, []);
  
  const fetchPremiumStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/check-premium-status`);
      if (response.data.success) {
        const data = {
          ...response.data,
          subscriptionType: response.data.subscriptionType || 'none',
          hasUsedTrial: response.data.hasUsedTrial || false
        };
        setPremiumStatus(data);
        if (checkPremiumStatus) {
          await checkPremiumStatus();
        }
      }
    } catch (error) {
      console.error('Error fetching premium status:', error);
    }
  };

  const startFreeTrial = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/api/auth/start-free-trial`);
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchPremiumStatus();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      
      const orderResponse = await axios.post(`${BASE_URL}/api/auth/create-order`, {
        plan: billingPeriod,
        isEarlyBird: isEarlyBird
      });
      
      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || 'Failed to create payment order');
        setIsLoading(false);
        return;
      }
      
      const { orderId, amount, currency } = orderResponse.data;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: currency || 'INR',
        name: 'AI Finance Pro',
        description: `${billingPeriod.charAt(0).toUpperCase() + billingPeriod.slice(1)} Subscription${isEarlyBird ? ' (Early Bird Offer)' : ''}`,
        order_id: orderId,
        handler: async function(response) {
          try {
            const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: billingPeriod,
              isEarlyBird: isEarlyBird
            });
            
            if (verifyResponse.data.success) {
              toast.success('Payment successful! Your subscription has been activated.');
              
              const amountValue = amount / 100; // Convert paise to rupees
              const expenseData = {
                title: `AI Finance Pro${isEarlyBird ? ' (Early Bird)' : ''}`,
                amount: amountValue,
                category: 'Subscription',
                description: `Premium ${billingPeriod} plan${isEarlyBird ? ' - Early Bird Offer' : ''}`,
                date: new Date().toISOString(),
                type: 'expense'
              };
              
              await addExpense(expenseData);
              await fetchPremiumStatus();
            } else {
              toast.error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed: ' + (error.response?.data?.message || error.message));
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: userData?.name || '',
          email: userData?.email || '',
          contact: userData?.phone || ''
        },
        notes: {
          plan: billingPeriod,
          offer: isEarlyBird ? 'early_bird' : 'regular'
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  const initiateCancel = () => {
    setShowCancelConfirm(true);
  };
  
  const confirmCancellation = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/api/auth/cancel-subscription`);
      if (response.data.success) {
        toast.success(response.data.message || 'Subscription canceled successfully');
        setShowCancelConfirm(false);
        await fetchPremiumStatus();
      } else {
        toast.error(response.data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while canceling subscription');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isPremiumUser = isPremium || premiumStatus.subscriptionType === 'monthly' || premiumStatus.subscriptionType === 'annually';
  const isTrialUser = premiumStatus.subscriptionType === 'trial';
  const isBasicUser = !isPremiumUser && !isTrialUser;
  
  // Calculate prices based on early bird status
  const getMonthlyPrice = () => {
    return isEarlyBird ? '1' : '30';
  };
  
  const getAnnualPrice = () => {
    return isEarlyBird ? '10' : '300';
  };
  
  const getMonthlyPriceForAnnual = () => {
    return isEarlyBird ? '0.83' : '25';
  };
  
  // Calculate savings percentage
  const getSavingsPercentage = () => {
    if (isEarlyBird) {
      // Early bird: ₹10/year vs ₹12/year (₹1 * 12)
      return Math.round((1 - 10/12) * 100);
    } else {
      // Regular: ₹300/year vs ₹360/year (₹30 * 12)
      return Math.round((1 - 300/360) * 100);
    }
  };
 
  return (
    <>
      <Sidebar onToggle={setIsSidebarCollapsed} />
      <div className={`
        flex-1 mt-10
        overflow-y-auto 
        transition-all 
        duration-300 
        ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}
        max-w-full
      `}>
        <div className="max-w-5xl mx-auto mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">Upgrade Your Financial Experience</h1>
          <p className="text-gray-600 md:text-lg">Get advanced tools and AI insights to manage your money smarter</p>
        </div>
        
        {/* Early Bird Banner */}
        {isEarlyBird && !isPremiumUser && (
          <div className="max-w-4xl mx-auto mb-6 bg-gradient-to-r from-yellow-50 to-amber-100 border border-amber-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="text-amber-500 mr-2" size={20} />
              <h2 className="text-lg font-bold text-amber-800">Early Bird Offer Ends In</h2>
            </div>
            <div className="flex justify-center gap-3 mb-2">
              <div className="bg-white px-3 py-1 rounded shadow-sm">
                <span className="text-amber-800 font-bold">{earlyBirdTimeLeft.days}</span>
                <span className="text-amber-600 text-xs ml-1">days</span>
              </div>
              <div className="bg-white px-3 py-1 rounded shadow-sm">
                <span className="text-amber-800 font-bold">{earlyBirdTimeLeft.hours}</span>
                <span className="text-amber-600 text-xs ml-1">hrs</span>
              </div>
              <div className="bg-white px-3 py-1 rounded shadow-sm">
                <span className="text-amber-800 font-bold">{earlyBirdTimeLeft.minutes}</span>
                <span className="text-amber-600 text-xs ml-1">min</span>
              </div>
              <div className="bg-white px-3 py-1 rounded shadow-sm">
                <span className="text-amber-800 font-bold">{earlyBirdTimeLeft.seconds}</span>
                <span className="text-amber-600 text-xs ml-1">sec</span>
              </div>
            </div>
            <p className="text-amber-700 font-medium">Subscribe now for just ₹1/month instead of ₹30/month!</p>
          </div>
        )}
        
        {!isPremiumUser ? (
          <div className="flex justify-center mb-9">
            <div className="bg-white rounded-full p-1 shadow-md inline-flex">
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${billingPeriod === 'monthly' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium transition flex items-center ${billingPeriod === 'annually' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                onClick={() => setBillingPeriod('annually')}
              >
                Annual <span className="ml-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Save {getSavingsPercentage()}%</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-11">
            <div className="bg-white rounded-xl p-1 shadow-md inline-flex">
              <span className={`px-6 py-2 rounded-xl text-sm font-small transition bg-blue-50`}>
                Your current <span className='capitalize'>{premiumStatus.subscriptionType}</span> plan is expiring in <span className='font-medium'>{premiumStatus.daysRemaining}</span> days!
              </span>
            </div>
          </div>
        )}
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-16 items-center">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden relative max-h-fit">
            {isBasicUser && (
              <div className="absolute top-4 right-4 bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                Current Plan
              </div>
            )}
            <div className="p-6 pb-0">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <Activity className="text-gray-700" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Basic</h2>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">₹0</span>
                  <span className="text-gray-600 ml-2">/ month</span>
                </div>
                <p className="text-gray-500 mt-2">Free forever</p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="text-gray-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700">Basic expense tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-gray-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700">Monthly reports</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-gray-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700">Up to 50 transactions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-gray-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700">Export data to Excel</span>
                </li>
              </ul>
              
              <button className="w-full bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition">
                {isBasicUser ? 'Current Plan' : 'Basic Plan'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden relative transform md:scale-105">
            {(isPremiumUser || isTrialUser) ? (
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                Current Plan
              </div>
            ) : isEarlyBird ? (
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                Early Bird Offer
              </div>
            ) : (
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                Recommended
              </div>
            )}
            <div className="p-6 pb-0">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Brain className="text-blue-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-blue-700">AI Finance Pro</h2>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-blue-700">
                    ₹{billingPeriod === 'monthly' ? getMonthlyPrice() : getMonthlyPriceForAnnual()}
                  </span>
                  <span className="text-gray-600 ml-2">/ month</span>
                  
                  {isEarlyBird && billingPeriod === 'monthly' && (
                    <span className="ml-3 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md line-through">₹30</span>
                  )}
                  
                  {isEarlyBird && billingPeriod === 'annually' && (
                    <span className="ml-3 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md line-through">₹25</span>
                  )}
                </div>
                {(isPremiumUser || isTrialUser) ? (
                  <p className="text-gray-500 mt-2">
                    {isTrialUser ? `Trial ends on: ${formatDate(premiumStatus.trialEndDate)}` : 
                      `Subscription ends on: ${formatDate(premiumStatus.subscriptionEndDate)}`}
                  </p>
                ) : (
                  <p className="text-gray-500 mt-2">
                    {billingPeriod === 'monthly' ? 'Billed monthly' : `Billed annually (₹${getAnnualPrice()}/year)`}
                    {billingPeriod === 'annually' && <span className="ml-2 text-green-600 font-medium">Save {getSavingsPercentage()}%</span>}
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-blue-50">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-800">Everything in Basic, plus:</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-800"><strong>AI-powered financial insights</strong></span>
                </li>
                <li className="flex items-start">
                  <PieChart className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-800">Comprehensive budget & expense management</span>
                </li>
                <li className="flex items-start">
                  <Calendar className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-800">Automated bill tracking & reminders</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-800">Unlimited transactions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-800">Advanced custom reports</span>
                </li>
              </ul>
              
              <div className="space-y-3">
                {isPremiumUser ? (
                  <div className="flex items-center justify-center gap-4">
                    <button 
                      className="w-full bg-green-600 text-white font-medium py-3 rounded-lg transition flex items-center justify-center"
                    >
                      Active Subscription
                    </button>
                    <button 
                      onClick={initiateCancel} 
                      className="w-full bg-transparent border border-red-600 text-red-600 font-medium py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : isTrialUser ? (
                  <button 
                    onClick={() => handleUpgrade()}
                    className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Upgrade Now'} <ArrowRight className="ml-2" size={18} />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleUpgrade()}
                      className={`w-full ${isEarlyBird ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 rounded-lg transition flex items-center justify-center`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : isEarlyBird ? 'Get Early Bird Offer' : 'Pay with Razorpay'} <ArrowRight className="ml-2" size={18} />
                    </button>
                    {
                      <button 
                        onClick={() => startFreeTrial()} 
                        className="w-full bg-transparent border border-blue-600 text-blue-600 font-medium py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                        disabled={isLoading || premiumStatus.hasUsedTrial}
                      >
                        {isLoading ? 'Processing...' : premiumStatus.hasUsedTrial ? 'Trial Unavailable' : 'Start 7-Day Free Trial'} 
                      </button>
                    }
                    <p className="text-xs text-center text-gray-500">
                      {isEarlyBird ? 'Limited time offer - Act now!' : 'No credit card required for trial'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center">What You Get With AI Finance Pro</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Personalized AI Recommendations</h3>
              <p className="text-gray-600">Get tailored financial advice based on your spending patterns, income, and financial goals.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comprehensive Budget Tools</h3>
              <p className="text-gray-600">Create and manage budgets across multiple categories with visual analytics and tracking.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill Management System</h3>
              <p className="text-gray-600">Never miss a payment with automated bill tracking, reminders, and payment scheduling.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Advanced Expense Analysis</h3>
              <p className="text-gray-600">Gain deeper insights into where your money goes with detailed categorization and trend analysis.</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-6 md:mb-0 md:mr-8">
              <div className="w-16 h-16 bg-blue-200 rounded-full mb-2 flex items-center justify-center mx-auto">
                <span className="text-blue-700 font-bold text-lg">SM</span>
              </div>
              <div className="text-center md:text-left">
                <p className="font-medium text-blue-700">Sophia M.</p>
                <p className="text-sm text-blue-600">Premium user since 2023</p>
              </div>
            </div>
            <div>
              <p className="text-blue-800 italic mb-3">"The AI insights have completely changed how I manage my finances. I've saved over ₹15,000 in the last 3 months just by following the personalized recommendations."</p>
              <div className="flex justify-center md:justify-start">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto my-16">
          <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your current billing period.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Is my financial data secure?</h3>
              <p className="text-gray-600">We take security seriously. All your data is encrypted and stored using industry-standard security practices. We never share your financial information with third parties.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How does the 7-day free trial work?</h3>
              <p className="text-gray-600">You can try all Pro features for 7 days without any charges. You won't be automatically billed after the trial - we'll ask if you want to continue with a paid plan.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit and debit cards, UPI, and net banking options through our secure payment provider, Razorpay.</p>
            </div>
          </div>
        </div>
        
        {/* Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-500 mr-2" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">Cancel Subscription?</h3>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to cancel your premium subscription? You'll lose access to all premium features at the end of your current billing period.</p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Keep Subscription
                </button>
                <button 
                  onClick={confirmCancellation}
                  className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UpgradePage;