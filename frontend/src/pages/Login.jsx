import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { googleAuth } from "../context/api.js";
import validator from "validator";
import FooterContainer from "../components/Footer.jsx";


const Login = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentChart, setCurrentChart] = useState("portfolio"); // Default chart
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [reclocation, setReclocation] = useState({ latitude: null, longitude: null });
  const [locationStatus, setLocationStatus] = useState('Fetching location...');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const [attempted, setAttempted] = useState(false);
  // Sample data for charts
  const barChartData = [
    { month: 'Jan', savings: 2400, expenses: 1800 },
    { month: 'Feb', savings: 1800, expenses: 2400 },
    { month: 'Mar', savings: 3200, expenses: 1900 },
    { month: 'Apr', savings: 2780, expenses: 2100 },
    { month: 'May', savings: 1890, expenses: 2300 },
    { month: 'Jun', savings: 2390, expenses: 2500 }
  ];
  
  const pieChartData = [
    { name: 'Housing', value: 35 },
    { name: 'Food', value: 20 },
    { name: 'Transport', value: 15 },
    { name: 'Entertainment', value: 10 },
    { name: 'Savings', value: 20 }
  ];
  
  const lineChartData = Array.from({ length: 12 }, (_, i) => ({
    month: i+1,
    value: 2000 + Math.random() * 5000
  }));
  
  const billsData = [
    { name: 'Rent', amount: 1200, dueDate: '25th', status: 'Upcoming' },
    { name: 'Electricity', amount: 850, dueDate: '15th', status: 'Paid' },
    { name: 'Internet', amount: 600, dueDate: '20th', status: 'Upcoming' },
    { name: 'Water', amount: 400, dueDate: '10th', status: 'Overdue' },
  ];
  useEffect(() => {
    // Prevent scrolling on mount
    document.body.style.overflow = 'auto'; // Changed to 'auto' to allow scrolling on mobile
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  useEffect(() => {
    // Set up auto-scrolling for charts every 2 seconds
    const autoScrollInterval = setInterval(() => {
      const charts = ['portfolio', 'income', 'budget', 'bills'];
      const currentIndex = charts.indexOf(currentChart);
      const nextIndex = (currentIndex + 1) % charts.length;
      setCurrentChart(charts[nextIndex]);
    }, 2000);
    
    // Clean up interval when component unmounts or when chart changes manually
    return () => clearInterval(autoScrollInterval);
  }, [currentChart]); // Re-create interval when currentChart changes

  useEffect(() => {
    setAcceptTerms(false);
  }, [state]);
  
  const fetchLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(location);
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.warn('Geolocation not supported');
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  // Initial location fetch on mount
  useEffect(() => {
    fetchLocation()
      .then((location) => {
        setReclocation(location);
        setLocationStatus('Location retrieved');
      })
      .catch((error) => {
        setReclocation({ latitude: null, longitude: null });
        setLocationStatus(`Location unavailable: ${error.message}`);
        // Don't show toast here; we'll handle it on submission
      });
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      
      let locationToSend = reclocation;
      // If no valid location, re-prompt the user
      if (!reclocation.latitude && !reclocation.longitude) {
        try {
          locationToSend = await fetchLocation();
          setReclocation(locationToSend);
          setLocationStatus('Location retrieved');
        } catch (error) {
          console.warn('User denied or failed to provide location:', error.message);
          setLocationStatus(`Location denied: ${error.message}`);
          toast.warn('Location access denied; proceeding without it.');
          locationToSend = { latitude: null, longitude: null };
        }
      }
      await sendLoginRequest(locationToSend);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

// Function to send login/signup request
const sendLoginRequest = async (reclocation) => {
    try {
      
      if (state==='Sign Up'&&!acceptTerms) {
          setShowError(true);
          toast.error('Please accept the terms and conditions');
          // Shake animation for the checkbox
          const checkbox = document.getElementById("terms");
          if (checkbox) {
            checkbox.classList.add("shake");
            setTimeout(() => {
              checkbox.classList.remove("shake");
            }, 1500);
          }
          return;
        } else {
          setShowError(false);
        }

        let response;
        if (!validator.isEmail(email)) {
              toast.error('Please enter a valid email address');
              setIsLoading(false);
              return;
            }
            setAttempted(true);
    
            

        if (state === "Sign Up") {
            if (password !== confirmPassword) {
                toast.error("Passwords don't match");
                setIsLoading(false);
                return;
            }
            response = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password, reclocation });
            if (response.data.success) {
              setState('Sign In');
              toast.success(response.data.message);
          } else {
              toast.error(response.data.message || "Something went wrong.");
          }
        } else {
            response = await axios.post(`${backendUrl}/api/auth/login`, { email, password, reclocation });
        
            if (response.data.success) {
              setIsLoggedin(true);
              const userData = await getUserData();
  
              const obj = { email, name };
              localStorage.setItem("user-info", JSON.stringify(obj));
  
              toast.success(response.data.message);
              navigate(userData.isOnboardingComplete ? "/dashboard" : "/onboarding");
          } else {
              toast.error(response.data.message || "Something went wrong.");
          }

          }
    } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred");
    } finally {
        setIsLoading(false); // Reset loading state in all cases
    }
};

  // Card flip animation variants
  const cardVariants = {
    hidden: { rotateY: 90, opacity: 0 },
    visible: { rotateY: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { rotateY: -90, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  // Input field animation variants
  const inputVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: i => ({ 
      y: 0, 
      opacity: 1, 
      transition: { 
        delay: i * 0.1,
        duration: 0.3
      } 
    })
  };

  // Function to toggle login/signup with animation delay
  const toggleState = (newState) => {
    if (isFlipping) return; // Prevents spam clicks
    setIsFlipping(true);
    setTimeout(() => {
      setState(newState);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsFlipping(false);
    }, 150);
  };
  
  const responseGoogle = async (authResult) => {
    axios.defaults.withCredentials = true;

    try {
        setIsLoading(true);
        

        if (!authResult["code"]) {
            throw new Error("No authorization code received from Google");
        }

        let locationToSend = reclocation;
        if (!reclocation.latitude && !reclocation.longitude) {
            try {
                locationToSend = await fetchLocation();
                setReclocation(locationToSend);
                setLocationStatus('Location retrieved');
            } catch (error) {
                console.warn('Google auth: Location fetch failed:', error.message);
                setLocationStatus(`Location denied: ${error.message}`);
                toast.warn('Location access denied; proceeding without it.');
                locationToSend = { latitude: null, longitude: null };
            }
        }

        const result = await googleAuth(authResult.code, locationToSend);

        setIsLoggedin(true);
        const userData = await getUserData();
        const { email, name, image } = result.data.user || {};
        const token = result.data.token;
        const obj = { email, name, token, image };
        localStorage.setItem('user-info', JSON.stringify(obj));

        toast.success(result.data.message);
        navigate(userData.isOnboardingComplete ? "/dashboard" : "/onboarding");
    } catch (e) {
        toast.error("Google login failed");
        console.error('Error while Google Login:', e.message);
        setIsLoading(false);
    }
};

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  const continuewithgoogle = () => {
    if (state==='Sign Up'&&!acceptTerms) {
      setShowError(true);
      toast.error('Please accept the terms and conditions');
      // Shake animation for the checkbox
      const checkbox = document.getElementById("terms");
      if (checkbox) {
        checkbox.classList.add("shake");
        setTimeout(() => {
          checkbox.classList.remove("shake");
        }, 500);
      }
      return;
    } else {
      setShowError(false);
    }
    googleLogin();
  }
    
  // Function to change chart type
  const changeChart = (chartType) => {
    setCurrentChart(chartType);
  };

  // Simple SVG Line Chart Component
  const SimpleLineChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = Math.min(...data.map(d => d.value)) * 0.9;
    const width = 320;
    const height = 200;
    const padding = 30;
    
    const xScale = (i) => padding + (i / (data.length - 1)) * (width - padding * 2);
    const yScale = (v) => height - padding - ((v - minValue) / (maxValue - minValue)) * (height - padding * 2);
    
    const points = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* X and Y axes */}
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#ccc" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#ccc" strokeWidth="1" />
        
        {/* Line path */}
        <polyline 
          fill="none"
          stroke="#5b9bd5"
          strokeWidth="2"
          points={points}
        />
        
        {/* Area under the curve */}
        <polyline 
          fill="rgba(91, 155, 213, 0.2)"
          stroke="none"
          points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`}
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <circle 
            key={i}
            cx={xScale(i)} 
            cy={yScale(d.value)} 
            r="4"
            fill="#fff"
            stroke="#5b9bd5"
            strokeWidth="2"
          />
        ))}
      </svg>
    );
  };
  
  // Simple SVG Bar Chart Component
  const SimpleBarChart = ({ data }) => {
    const width = 320;
    const height = 200;
    const padding = 30;
    const barWidth = (width - padding * 2) / data.length / 2.5;
    
    const maxValue = Math.max(...data.map(d => Math.max(d.savings, d.expenses)));
    const yScale = (value) => ((height - padding * 2) * value) / maxValue;
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* X axis */}
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#ccc" strokeWidth="1" />
        
        {/* Bars */}
        {data.map((d, i) => {
          const x = padding + i * ((width - padding * 2) / data.length);
          return (
            <g key={i}>
              {/* Savings bar */}
              <rect
                x={x}
                y={height - padding - yScale(d.savings)}
                width={barWidth}
                height={yScale(d.savings)}
                fill="#5b9bd5"
              />
              
              {/* Expenses bar */}
              <rect
                x={x + barWidth + 2}
                y={height - padding - yScale(d.expenses)}
                width={barWidth}
                height={yScale(d.expenses)}
                fill="#ed7d31"
              />
              
              {/* Month label */}
              <text
                x={x + barWidth + 1}
                y={height - padding + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#555"
              >
                {d.month}
              </text>
            </g>
          );
        })}
        
        {/* Legend */}
        <rect x={width - 100} y={20} width={10} height={10} fill="#5b9bd5" />
        <text x={width - 85} y={30} fontSize="10" fill="#555">Savings</text>
        <rect x={width - 100} y={40} width={10} height={10} fill="#ed7d31" />
        <text x={width - 85} y={50} fontSize="10" fill="#555">Expenses</text>
      </svg>
    );
  };
  
  // Simple SVG Pie Chart Component
  const SimplePieChart = ({ data }) => {
    const width = 200;
    const height = 200;
    const radius = 80;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate the total value
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Colors for pie segments
    const colors = ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#70ad47'];
    
    // Calculate pie segments
    let startAngle = 0;
    const segments = data.map((item, index) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // Calculate arc path
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      // Determine if the arc should be drawn as a large arc
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      // Create SVG path
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      // Store the middle angle for label positioning
      const midAngle = startAngle + angle / 2;
      const labelX = centerX + (radius * 0.7) * Math.cos(midAngle);
      const labelY = centerY + (radius * 0.7) * Math.sin(midAngle);
      
      // Update start angle for next segment
      const segment = {
        path,
        color: colors[index % colors.length],
        labelX,
        labelY,
        name: item.name,
        value: item.value
      };
      
      startAngle = endAngle;
      return segment;
    });
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Draw pie segments */}
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}
        
        {/* Draw center circle for donut effect */}
        <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="#fff" />
        
        {/* Legend */}
        <text x={centerX} y={centerY} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">
          Budget
        </text>
        <text x={centerX} y={centerY + 15} textAnchor="middle" fontSize="10" fill="#777">
          Distribution
        </text>
      </svg>
    );
  };
  
  // Bills Table Component
  const BillsTable = ({ data }) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Bill</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-center">Due Date</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((bill, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3">{bill.name}</td>
                <td className="px-4 py-3 text-right">${bill.amount}</td>
                <td className="px-4 py-3 text-center">{bill.dueDate}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bill.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                    bill.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {bill.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
      <span className="ml-2">Logging in...</span>
    </div>
  );

  // Chart selector for mobile view
  const MobileChartSelector = () => (
    <div className="md:hidden flex justify-center mt-6 mb-2">
      <div className="inline-flex p-1 bg-white rounded-lg shadow-md">
        <button 
          onClick={() => changeChart('portfolio')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
            currentChart === 'portfolio' ? 'bg-blue-600 text-white' : 'text-blue-600'
          }`}
        >
          Portfolio
        </button>
        <button 
          onClick={() => changeChart('income')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
            currentChart === 'income' ? 'bg-blue-600 text-white' : 'text-blue-600'
          }`}
        >
          Income
        </button>
        <button 
          onClick={() => changeChart('budget')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
            currentChart === 'budget' ? 'bg-blue-600 text-white' : 'text-blue-600'
          }`}
        >
          Budget
        </button>
        <button 
          onClick={() => changeChart('bills')}
          className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
            currentChart === 'bills' ? 'bg-blue-600 text-white' : 'text-blue-600'
          }`}
        >
          Bills
        </button>
      </div>
    </div>
  );

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background elements */}
      <div className="absolute top-20 -right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -left-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-10 left-40 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Main container with glass effect */}
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl shadow-2xl bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-2 mx-4 my-4 md:mx-auto md:h-[90vh] overflow-y-auto">
        {/* Back button with arrow */}
        <div className="absolute top-6 left-5 z-10">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-md hover:bg-gray-100 transition duration-200"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>  
          </button>
        </div>

        {/* Mobile view chart section (above login form) */}
        <div className="block md:hidden w-full pt-16 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-4"
          >
            <h2 className="text-xl font-bold text-indigo-900">Financial Freedom Starts Here</h2>
            <p className="text-sm text-indigo-700 mt-1">Track, manage, and grow your wealth</p>
          </motion.div>

          <MobileChartSelector />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentChart}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white p-3 rounded-xl shadow-md mb-6"
            >
              {currentChart === 'portfolio' && (
                <>
                  <h3 className="text-md font-semibold text-gray-800 mb-1">Portfolio Growth</h3>
                  <SimpleLineChart data={lineChartData} />
                </>
              )}
              
              {currentChart === 'income' && (
                <>
                  <h3 className="text-md font-semibold text-gray-800 mb-1">Income vs Expenses</h3>
                  <SimpleBarChart data={barChartData} />
                </>
              )}
              
              {currentChart === 'budget' && (
                <>
                  <h3 className="text-md font-semibold text-gray-800 mb-1">Budget Allocation</h3>
                  <div className="flex justify-center">
                    <SimplePieChart data={pieChartData} />
                  </div>
                </>
              )}
              
              {currentChart === 'bills' && (
                <>
                  <h3 className="text-md font-semibold text-gray-800 mb-1">Upcoming Bills</h3>
                  <BillsTable data={billsData} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Left side - Finance visualizations (Desktop only) */}
        <div className="hidden md:flex md:w-1/2 p-4 flex-col justify-center items-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-4"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-900">Financial Freedom Starts Here</h2>
            <p className="text-indigo-700 mt-2">Track, manage, and grow your wealth</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut"  }}
            className="w-full flex flex-col gap-4"
          >
            {/* Chart Navigation */}
            <div className="flex justify-center mb-2 space-x-2">
              <button 
                onClick={() => changeChart('portfolio')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentChart === 'portfolio' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Portfolio
              </button>
              <button 
                onClick={() => changeChart('income')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentChart === 'income' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Income
              </button>
              <button 
                onClick={() => changeChart('budget')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentChart === 'budget' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Budget
              </button>
              <button 
                onClick={() => changeChart('bills')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentChart === 'bills' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Bills
              </button>
            </div>
            
            {/* Dynamic Chart Content */}
            <AnimatePresence mode="wait">
            <motion.div 
              key={currentChart}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white p-4 rounded-xl shadow-md"
            >
              {currentChart === 'portfolio' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Portfolio Growth</h3>
                    <SimpleLineChart data={lineChartData} />
                  </>
                )}

                {currentChart === 'income' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Income vs Expenses</h3>
                    <SimpleBarChart data={barChartData} />
                  </>
                )}

                {currentChart === 'budget' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Budget Allocation</h3>
                    <div className="flex justify-center">
                      <SimplePieChart data={pieChartData} />
                    </div>
                  </>
                )}

                {currentChart === 'bills' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Bills</h3>
                    <BillsTable data={billsData} />
                  </>
                )}
            </motion.div>
          </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Right side - Login Form */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={cardVariants}
              className="rounded-xl shadow-lg p-6 bg-white"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{state}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {state === "Sign Up" ? "Create an account to get started" : "Welcome back to your financial dashboard"}
                </p>
              </div>
              {/* {attempted && !acceptTerms && (
                  <div className="error-message bg-red-50 border-l-4 border-red-500 p-4 rounded animate-fade-in">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-600">
                          Please check the checkbox of terms and condition and privacy policy to continue!
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}
              <form onSubmit={onSubmitHandler} className="space-y-2.5">
                {state === "Sign Up" && (
                  <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={inputVariants}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                      required
                    />
                  </motion.div>
                )}
                
                <motion.div
                  custom={state === "Sign Up" ? 1 : 0}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="you@example.com"
                    required
                  />
                </motion.div>
                
                <motion.div
                  custom={state === "Sign Up" ? 2 : 1}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="•••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>
                
                {state === "Sign Up" && (
                  <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={inputVariants}
                    className="relative"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="•••••••••••"
                      required
                    />
                  </motion.div>
                )}
                {state === "Sign In" && (
                  <motion.div
                  custom={2}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-right"
                  >
                  <Link to="/reset-password" className="text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                  </motion.div>
                  )}
                
                {state === "Sign Up" && (
                  <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={inputVariants}
                    className="flex items-start mt-2"
                  >
                    <div className={`flex items-start mt-2 ${showError ? 'error-container' : ''}`}>
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className={`w-4 h-4 border rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 ${
                          attempted && !acceptTerms ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <label htmlFor="terms" id="terms" className={`ml-2 text-sm ${
                      attempted && !acceptTerms ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      I agree to the <Link to='/terms-and-condition' className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to='/privacy-policy' className="text-blue-600 hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                  </motion.div>
                )}
                
                <motion.div
                  custom={state === "Sign Up" ? 5 : 2}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 ${
                      isLoading || (state === "Sign Up" && !acceptTerms) ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-indigo-700'
                    } text-white font-medium rounded-lg shadow-md transition duration-300 flex justify-center items-center`}
                  >
                    {isLoading ? <LoadingSpinner /> : state}
                  </button>
                </motion.div>
                
                <motion.div
                  custom={state === "Sign Up" ? 5 : 3}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                  className="relative flex items-center my-4"
                >
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-600 text-sm">or continue with</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </motion.div>
                
                <motion.div
                  custom={state === "Sign Up" ? 6 : 4}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >
                  <button
                    type="button"
                    onClick={() => continuewithgoogle()}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition duration-300"
                  >
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Google</span>
                  </button>
                </motion.div>
              </form>
              
              <motion.div
                custom={state === "Sign Up" ? 7 : 5}
                initial="hidden"
                animate="visible"
                variants={inputVariants}
                className="text-center mt-6"
              >
                <p className="text-sm text-gray-600">
                  {state === "Sign Up" ? "Already have an account?" : "Don't have an account yet?"}
                  <button
                    type="button"
                    onClick={() => toggleState(state === "Sign Up" ? "Sign In" : "Sign Up")}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                  >
                    {state === "Sign Up" ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          
          <div className="text-center mt-4 text-xs text-gray-500">
            <p>© 2025 Finvista Finance Management App. All rights reserved.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
      <FooterContainer/>    
    </>
  );
};

export default Login;