import React, { useContext, useState, useEffect } from 'react'
import { Mail, Key, ShieldCheck, CheckCircle2, ArrowLeft, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import Navbar from '../components/Navbar'

const ResetPassword = () => {
  const navigate = useNavigate()
  const { token } = useParams() // Get token from URL if it exists
  const location = useLocation()
  const { backendUrl } = useContext(AppContent)
  
  // Parse URL query params if any
  const queryParams = new URLSearchParams(location.search)
  const emailFromQuery = queryParams.get('email')
  const otpFromQuery = queryParams.get('otp')
  
  // Step management (if token exists, go straight to password reset)
  const [currentStep, setCurrentStep] = useState(token ? 3 : 1)
  const [loading, setLoading] = useState(token ? true : false)
  
  // Form states
  const [email, setEmail] = useState(emailFromQuery || '')
  const [otp, setOtp] = useState(otpFromQuery ? otpFromQuery.split('') : ['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validToken, setValidToken] = useState(false)
  const [otpHint, setOtpHint] = useState('')
  
  // Resend OTP state
  const [canResendOtp, setCanResendOtp] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)

  axios.defaults.withCredentials = true

  // Verify token if present
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  // Verify the token and get user email
  const verifyToken = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/auth/verify-reset-token/${token}`);
      
      if (data.success) {
        setEmail(data.email);
        setOtpHint(data.otpHint);
        setValidToken(true);
      } else {
        toast.error('This reset link has expired or is invalid');
        setCurrentStep(1); // Go back to email input
      }
    } catch (error) {
      toast.error('This reset link has expired or is invalid');
      setCurrentStep(1); // Go back to email input
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer
    if (resendCountdown > 0 && !canResendOtp && currentStep === 2) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1)
      }, 1000)
    } else if (resendCountdown === 0) {
      setCanResendOtp(true)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resendCountdown, canResendOtp, currentStep])

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value !== '' && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus()
    }
  }

  // Handle backspace to move to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus()
    }
  }

  // Submit email to request OTP
  const handleSubmitEmail = async (e) => {
    e.preventDefault()
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email })
      
      if (data.success) {
        toast.success(data.message || 'Reset link sent to your email', {
          icon: <Mail className="text-blue-500" />
        })
        setCurrentStep(2)
        // Focus the first OTP input when moving to next step
        setTimeout(() => {
          const firstInput = document.getElementById('otp-input-0')
          if (firstInput) firstInput.focus()
        }, 100)
      } else {
        toast.info('If this email exists in our system, a reset link has been sent.')
      }
    } catch (error) {
      toast.info('If this email exists in our system, a reset link has been sent.')
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP and move to password reset
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      toast.error('Please enter a complete 6-digit verification code')
      return
    }

    // We're just moving to the next step - actual verification happens with password reset
    setCurrentStep(3)
  }

  // Submit new password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true);
      let data;
      
      // Use token-based reset if available, otherwise use OTP-based reset
      if (token && validToken) {
        const response = await axios.post(`${backendUrl}/api/auth/reset-password-with-token`, {
          token,
          newPassword
        });
        data = response.data;
      } else {
        const response = await axios.post(`${backendUrl}/api/auth/reset-password`, {
          email,
          otp: otp.join(''),
          newPassword
        });
        data = response.data;
      }
      
      if (data.success) {
        toast.success(data.message || 'Password reset successfully', {
          icon: <CheckCircle2 className="text-green-500" />
        })
        navigate('/login')
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  const resendOtp = async () => {
    if (!canResendOtp) return

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email })
      if (data.success) {
        toast.info('New reset link sent to your email', {
          icon: <Mail className="text-blue-500" />
        })
        // Reset OTP inputs and resend timer
        setOtp(['', '', '', '', '', ''])
        setCanResendOtp(false)
        setResendCountdown(60)
      } else {
        toast.info('If this email exists in our system, a reset link has been sent.')
      }
    } catch (error) {
      toast.info('If this email exists in our system, a reset link has been sent.')
    } finally {
      setLoading(false);
    }
  }

  // Go back to previous step
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          {/* Header with back button */}
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-grow text-center">
              <ShieldCheck className="mx-auto h-15 w-15 text-blue-600" />
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Processing...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Step 1: Email Entry */}
              {currentStep === 1 && (
                <>
                  <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold text-gray-800">Reset Password</h2>
                    <p className="mt-2 text-gray-500">
                      Enter your registered email address to receive a reset link
                    </p>
                  </div>

                  <form onSubmit={handleSubmitEmail} className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <Mail className="h-5 w-5" />
                      Send Reset Link
                    </button>
                  </form>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <>
                  <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold text-gray-800">Verify Code</h2>
                    <p className="mt-2 text-gray-500">
                      Enter the 6-digit verification code sent to
                      <span className="font-semibold text-blue-600 ml-1">
                        {email}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-input-${index}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 uppercase"
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
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <Key className="h-5 w-5" />
                      Verify Code
                    </button>
                  </form>

                  <div className="text-center text-gray-500 text-sm">
                    Verification code is valid for 10 minutes
                  </div>
                </>
              )}

              {/* Step 3: New Password */}
              {currentStep === 3 && (
                <>
                  <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold text-gray-800">Create New Password</h2>
                    {token && validToken && (
                      <p className="mt-2 text-gray-500">
                        Set a new password for <span className="font-semibold text-blue-600">{email}</span>
                        {otpHint && <span className="text-sm text-gray-400 block mt-1">(Verification code is ending with {otpHint})</span>}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                          placeholder="New password"
                          minLength={1}
                          required
                        />
                      </div>
                      <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      placeholder="Confirm password"
                      minLength={1}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Reset Password
                </button>
              </form>

              <div className="text-center text-gray-500 text-sm">
                Make sure your password is at least 8 characters and includes numbers and special characters
              </div>
                </>
              )}
            </>
            )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword;

