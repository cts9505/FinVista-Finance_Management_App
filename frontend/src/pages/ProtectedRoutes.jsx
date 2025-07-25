// ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppContent } from '../context/AppContext'; // Adjust this path as needed
import { toast } from 'react-toastify';

/**
 * A wrapper component for routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = () => {
  const { userData } = useContext(AppContent);
  const location = useLocation();

  // Check if user is authenticated
  if (!userData) {
    // Redirect to login and remember where they were trying to go
    toast.warn(
        <div>
          <strong>🔐 Authentication Required</strong>
          <div>Please log in to view this page.</div>
        </div>,
        {
          position: 'top-right',
          style: {
            background: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            borderRadius: '8px',
            padding: '12px',
          },
          icon: false,
        }
      );
      
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // For routes that require email verification
//   if (!userData.isVerified && location.pathname !== '/verify-email') {
//     return <Navigate to="/verify-email" replace />;
//   }

  // If authenticated, render the child route components
  return <Outlet />;
};

// Optional: Admin Route protector for admin-only pages
const AdminRoute = () => {
  const { userData } = useContext(AppContent);
  
  // Check if user is authenticated and is an admin
  if (!userData || !userData.isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export { ProtectedRoute, AdminRoute };