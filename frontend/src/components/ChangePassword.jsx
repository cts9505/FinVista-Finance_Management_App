import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, Loader2, Shield } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// UPDATED: Renamed to PasswordModal and added 'mode' & 'onSuccess' props
const PasswordModal = ({ mode = 'change', onClose, onSuccess }) => {
  // State for toggling password visibility
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // NEW: A flag to easily check the mode
  const isSetMode = mode === 'set';

  // NEW: Using Formik for robust form handling and validation with Yup
  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    // NEW: Validation schema is now dynamic based on the mode
    validationSchema: Yup.object({
      currentPassword: isSetMode
        ? Yup.string() // Not required in 'set' mode
        : Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your new password'),
    }),
    // UPDATED: handleSubmit is now Formik's onSubmit
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const endpoint = isSetMode ? '/api/auth/set-password' : '/api/auth/change-password';
        const payload = isSetMode
          ? { newPassword: values.newPassword }
          : { currentPassword: values.currentPassword, newPassword: values.newPassword };

        const { data } = await axios.post(`${BASE_URL}${endpoint}`, payload, { withCredentials: true });

        if (data.success) {
          toast.success(data.message);
          if (onSuccess) {
            onSuccess(values.newPassword); // Pass the new password back for chained actions
          }
          onClose();
        } else {
          setFieldError('currentPassword', data.message); // Show backend errors on the form
          toast.error(data.message);
        }
      } catch (error) {
        const message = error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(message);
        // Display the error on the most relevant field
        setFieldError(isSetMode ? 'newPassword' : 'currentPassword', message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleVisibility = (field) => {
    setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden relative max-w-md w-full">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <Shield className="mr-2 text-gray-500" size={22} />
          {/* UPDATED: Title changes based on mode */}
          {isSetMode ? 'Create a Password' : 'Change Password'}
        </h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        
        {isSetMode && (
             <p className="text-sm text-gray-600 mb-4 -mt-2">For your security, please create a password to perform this action.</p>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* UPDATED: Current Password field is now conditional */}
          {!isSetMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.current ? 'text' : 'password'}
                  name="currentPassword"
                  {...formik.getFieldProps('currentPassword')}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm ${ formik.touched.currentPassword && formik.errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => toggleVisibility('current')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {passwordVisibility.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formik.touched.currentPassword && formik.errors.currentPassword ? (
                <p className="text-red-500 text-xs mt-1">{formik.errors.currentPassword}</p>
              ) : null}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={passwordVisibility.new ? 'text' : 'password'}
                name="newPassword"
                {...formik.getFieldProps('newPassword')}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm ${formik.touched.newPassword && formik.errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button type="button" onClick={() => toggleVisibility('new')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {passwordVisibility.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword ? (
              <p className="text-red-500 text-xs mt-1">{formik.errors.newPassword}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={passwordVisibility.confirm ? 'text' : 'password'}
                name="confirmPassword"
                {...formik.getFieldProps('confirmPassword')}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button type="button" onClick={() => toggleVisibility('confirm')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {passwordVisibility.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
            ) : null}
          </div>

          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={onClose} className="w-full py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={formik.isSubmitting} className="w-full py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center justify-center disabled:opacity-50">
              {formik.isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
              {/* UPDATED: Button text changes based on mode */}
              {isSetMode ? 'Set Password' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// UPDATED: Default export name
export default PasswordModal;