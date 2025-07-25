import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck, LogIn } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Import components - assuming these exist in your project
import Navbar from '../components/Navbar';


const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const PasswordChangePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Assuming you have an endpoint that verifies JWT or session
        const response = await axios.post(`${BASE_URL}/api/auth/is-auth`, {
          withCredentials: true // If using cookies for auth
        });
        
        if (response.data.success) {
          setIsLoggedIn(true);
        } else {
          // User is not logged in, redirect to login page
          toast.error('Please log in to change your password');
          navigate('/login', { state: { from: '/change-password' } });
        }
      } catch (error) {
        // API error or user is not authenticated
        toast.error('Please log in to change your password');
        navigate('/login', { state: { from: '/change-password' } });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } 

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const currentPassword = formData.currentPassword;
      const newPassword = formData.newPassword;
      
      const response = await axios.put(`${BASE_URL}/api/auth/change-password`, 
        { currentPassword, newPassword },
        { withCredentials: true } // If using cookies for auth
      );
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success(response.data.message || 'Password changed successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
        
        // If the error is about current password being incorrect
        if (error.response.data.field === 'currentPassword') {
          setErrors(prev => ({
            ...prev,
            currentPassword: 'Current password is incorrect'
          }));
        }
      } else {
        toast.error('An error occurred while changing password');
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 mt-3">
          <div className="max-w-md mx-auto my-8 bg-white p-6 md:p-8 rounded-lg shadow-md">
          {!isSuccess  &&(<div className="text-center mb-8">
              <div className="bg-blue-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
                <KeyRound className="text-blue-600" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Change Your Password</h1>
              <p className="text-gray-600 mt-2">Update your password to keep your account secure</p>
            </div>)}

            {isSuccess ? (
              <div className="text-center py-8">
                <div className="bg-green-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <ShieldCheck className="text-green-600" size={40} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Changed Successfully!</h2>
                <p className="text-gray-600 mb-6">Your password has been updated. You'll receive a confirmation email shortly.</p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Change Again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisibility.currentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500
                        ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisibility.currentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisibility.newPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500
                        ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisibility.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Try keeping password of length 8!</p>
                </div>

                {/* Confirm New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisibility.confirmNewPassword ? 'text' : 'password'}
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500
                        ${errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmNewPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisibility.confirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword}</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs font-medium text-gray-700 mb-2">Ideal Password should have:</p>
                  <ul className="text-xs text-gray-600 pl-5 space-y-1 list-disc">
                    <li>Be at least 8 characters long</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      w-full py-3 rounded-md transition-colors text-white font-medium
                      ${isSubmitting 
                        ? 'bg-blue-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'}
                    `}
                  >
                    {isSubmitting ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* If there's a session timeout or token expires while on the page */}
          {!isLoggedIn && (
            <div className="max-w-md mx-auto mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center">
                <LogIn className="text-yellow-600 mr-3" size={20} />
                <p className="text-yellow-800">
                  Session expired. Please{' '}
                  <button 
                    onClick={() => navigate('/login', { state: { from: '/change-password' } })}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    log in
                  </button>{' '}
                  to change your password.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PasswordChangePage;