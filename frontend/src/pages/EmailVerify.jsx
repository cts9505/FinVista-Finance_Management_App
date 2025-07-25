import React, { useContext, useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, CheckCircle2, ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Lottie from 'lottie-react';
import verificationSuccess from '../assets/animations/email-verification-success.json';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL if it exists
  const location = useLocation();
  const { backendUrl, userData } = useContext(AppContent);

  // Parse URL query params if any
  const queryParams = new URLSearchParams(location.search);
  const otpFromQuery = queryParams.get('otp');

  // Step management (if token exists, verify immediately)
  const [currentStep, setCurrentStep] = useState(token ? 2 : 1);
  const [loading, setLoading] = useState(token ? true : false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(otpFromQuery ? otpFromQuery.split('') : ['', '', '', '', '', '']);
  const [userId, setUserId] = useState(null);
  const [validToken, setValidToken] = useState(false);

  // Resend OTP state
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Refs for OTP inputs
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  axios.defaults.withCredentials = true;

  // Check user verification status on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        setInitialLoading(true);
        
        // If token exists, verify it and return early - don't check anything else
        if (token) {
          await verifyToken();
          setInitialLoading(false);
          return;
        }
        
        // No token - proceed with normal flow
        if (userData && userData._id) {
          setUserId(userData._id);
          
          // Get user's email from backend using userId
          const { data } = await axios.get(`${backendUrl}/api/auth/user-email/${userData._id}`);
          setEmail(data.email || '');
          
          // Check if user already verified
          if (userData.isAccountVerified) {
            setVerified(true);
            toast.info('Your account is already verified!');
            // Start redirect countdown
            startRedirectCountdown();
            return;
          }
          
          // If not token verification, request OTP automatically
          requestVerificationOtp(userData._id);
        }
      } catch (error) {
        toast.error('Error checking verification status');
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    checkVerificationStatus();
  }, [userData, backendUrl]); // Remove token from the dependency array

  // Verify the token
  const verifyToken = async () => {
    try {
      setLoading(true);
      setVerifying(true);
      const { data } = await axios.get(`${backendUrl}/api/auth/verify-email-token/${token}`);
      
      if (data.success) {
        setEmail(data.email);
        setValidToken(true);
        setVerified(true);
        toast.success(data.message || 'Email verified successfully!', {
          icon: <CheckCircle2 className="text-green-500" />
        });
        // Start redirect countdown
        startRedirectCountdown();
      } else {
        toast.error('This verification link has expired or is invalid');
        setCurrentStep(1);
      }
    } catch (error) {
      // If the backend returned a response with a message, use that
      const errorMessage = error.response?.data?.message || 'This verification link has expired or is invalid';
      toast.error(errorMessage);
      
      // Don't change step if we had a server error rather than an invalid token
      if (error.response?.status !== 500) {
        setCurrentStep(1);
      }
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  // Countdown timer for redirect after successful verification
  const startRedirectCountdown = () => {
    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0 && !canResendOtp && !verified) {
      timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown, canResendOtp, verified]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace to move to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Request OTP with userId
  const requestVerificationOtp = async (userIdParam = null) => {
    try {
      setLoading(true);
      const userIdToUse = userIdParam || userId;
      
      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`, {
        userId: userIdToUse
      });
      
      if (data.success) {
        toast.success(data.message || 'Verification code sent to your email', {
          icon: <Mail className="text-blue-500" />
        });
        setUserId(data.userId || userIdToUse);
        setCurrentStep(2);
        
        // Focus the first OTP input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } else {
        toast.info('If this email exists in our system, a verification code has been sent.');
      }
    } catch (error) {
      toast.info('If this email exists in our system, a verification code has been sent.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter a complete 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      setVerifying(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        userId,
        otp: otpCode
      });
      
      if (data.success) {
        setVerified(true);
        toast.success(data.message || 'Email verified successfully', {
          icon: <CheckCircle2 className="text-green-500" />
        });
        
        // Start redirect countdown
        startRedirectCountdown();
      } else {
        toast.error(data.message || 'Failed to verify email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!canResendOtp) return;

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`, {
        userId: userId
      });
      
      if (data.success) {
        toast.info('New verification code sent to your email', {
          icon: <Mail className="text-blue-500" />
        });
        setOtp(['', '', '', '', '', '']);
        setCanResendOtp(false);
        setResendCountdown(60);
        
        // Focus the first OTP input after resend
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } else {
        toast.info('If this email exists in our system, a verification code has been sent.');
      }
    } catch (error) {
      toast.info('If this email exists in our system, a verification code has been sent.');
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step or home
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6 relative overflow-hidden">
          {/* Decorative blue top edge */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
          
          {/* Header with back button */}
          {!verified && (
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-grow text-center">
              <ShieldCheck className="mx-auto h-16 w-16 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800 mt-2">Email Verification</h1>
            </div>
            <div className="w-8"></div> {/* Empty div for balance */}
          </div>
          )}
          {initialLoading && (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg font-medium animate-pulse">
                Checking verification status...
              </p>
            </div>
          )}

          {loading && !initialLoading && !verified && (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg font-medium animate-pulse">
                {verifying ? "Verifying your email..." : "Processing..."}
              </p>
            </div>
          )}

          {verified && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-48 h-48">
                <Lottie 
                  animationData={verificationSuccess} 
                  loop={false} 
                  autoplay 
                  className="w-full h-full"
                />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Email Verified!</h2>
                <p className="text-gray-600">
                  Your email has been successfully verified. Thank you!
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-500">
                  Redirecting to home page in <span className="text-blue-600 font-bold">{redirectCountdown}</span> seconds
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Go to Home Page Now
                </button>
              </div>
            </div>
          )}

          {!loading && !verified && !initialLoading && (
            <>
              {/* OTP Verification */}
              <div className="transition-all duration-500">
                <div className="text-center">
                  <p className="mt-2 text-gray-600">
                    We've sent a 6-digit verification code to
                    <span className="font-semibold text-blue-600 ml-1">
                      {email || 'your email address'}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6 mt-8">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
                        pattern="\d*"
                        inputMode="numeric"
                        required
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={!canResendOtp}
                      className={`flex items-center gap-2 ${
                        canResendOtp
                          ? 'text-blue-600 hover:underline'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Mail className="h-5 w-5" />
                      {canResendOtp
                        ? 'Resend Code'
                        : `Resend in ${resendCountdown}s`}
                    </button>
                    <p className="text-gray-500 text-sm">Check spam folder</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Verify Email
                  </button>
                </form>

                <div className="text-center text-gray-500 text-sm mt-4">
                  Verification code is valid for 10 minutes
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;