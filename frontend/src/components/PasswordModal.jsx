// src/components/PasswordModal.jsx

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Shield, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const PasswordModal = ({ mode, onClose, onSuccess }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Determine validation schema and initial values based on mode
  const isSetMode = mode === 'set';

  const validationSchema = Yup.object({
    currentPassword: isSetMode
      ? Yup.string()
      : Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Please confirm your new password'),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const endpoint = isSetMode ? '/api/auth/set-password' : '/api/auth/change-password';
        const payload = isSetMode
          ? { newPassword: values.newPassword }
          : { currentPassword: values.currentPassword, newPassword: values.newPassword };

        const response = await axios.post(`${BASE_URL}${endpoint}`, payload, { withCredentials: true });

        if (response.data.success) {
          toast.success(response.data.message);
          if (onSuccess) onSuccess(values.newPassword); // Pass new password back for chaining actions
          onClose();
        } else {
          // Handle specific backend errors
          setFieldError('currentPassword', response.data.message);
          toast.error(response.data.message);
        }
      } catch (error) {
        const message = error.response?.data?.message || `Failed to ${isSetMode ? 'set' : 'change'} password.`;
        toast.error(message);
        setFieldError('currentPassword', message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-700 flex items-center">
            <Shield size={20} className="mr-2" />
            {isSetMode ? 'Create Your Password' : 'Change Your Password'}
          </h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {!isSetMode && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  {...formik.getFieldProps('currentPassword')}
                  className={`w-full mt-1 p-2 border rounded-lg ${formik.touched.currentPassword && formik.errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formik.touched.currentPassword && formik.errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.currentPassword}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                {...formik.getFieldProps('newPassword')}
                className={`w-full mt-1 p-2 border rounded-lg ${formik.touched.newPassword && formik.errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                {...formik.getFieldProps('confirmPassword')}
                className={`w-full mt-1 p-2 border rounded-lg ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
               <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={formik.isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50">
              {formik.isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
              {isSetMode ? 'Set Password' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;