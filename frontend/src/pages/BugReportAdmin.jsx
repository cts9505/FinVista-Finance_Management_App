// BugReportsAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowDownCircle, ArrowUpCircle, Edit, Eye, EyeOff, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

const statusOptions = ["open", "in-progress", "resolved", "closed"];
const priorityOptions = ["low", "medium", "high", "critical"];

const BugReportsAdmin = () => {
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    adminNotes: ''
  });
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate=useNavigate();
  // Fetch all bug reports on component mount
  useEffect(() => {
    fetchBugReports();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {

        const response = await axios.get(`${backendUrl}/api/auth/check-admin`);

        if (response.data.success && response.data.isAdmin) {
          setIsAdmin(true);
          fetchBugReports(); // Fetch bug reports only if admin
        } else {
          toast.error('You do not have permission to access this page');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying permissions. Please try again.');
        navigate('/dashboard');
      }
    };

    checkAdminStatus();
  }, [navigate, backendUrl]);

  const fetchBugReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/auth/bug-reports`);
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

  const toggleExpand = (reportId) => {
    if (expandedReport === reportId) {
      setExpandedReport(null);
    } else {
      setExpandedReport(reportId);
    }
  };

  const startEdit = (report) => {
    setEditingReport(report._id);
    setEditForm({
      status: report.status,
      priority: report.priority,
      adminNotes: report.adminNotes || ''
    });
  };

  const cancelEdit = () => {
    setEditingReport(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  const updateBugReport = async (reportId) => {
    try {
      
        const response = await axios.patch(`${backendUrl}/api/auth/update-bug-report/${reportId}`, editForm);

      if (response.data.success) {
        toast.success('Bug report updated successfully');
        setEditingReport(null);
        
        // Update the bugReports state with the updated report
        setBugReports(prevReports => 
          prevReports.map(report => 
            report._id === reportId ? {...report, ...editForm} : report
          )
        );
      } else {
        toast.error(response.data.message || 'Failed to update bug report');
      }
    } catch (error) {
      console.error('Error updating bug report:', error);
      toast.error('Error updating bug report. Please try again.');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading && !isAdmin) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
          <FooterContainer />
        </div>
      );
    }
  
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
              <p className="text-gray-600">You do not have permission to view this page.</p>
            </div>
          </div>
          <FooterContainer />
        </div>
      );
    }

  return (
    <>
    <Navbar/>
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Bug Reports Dashboard</h1>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Total Reports: {bugReports.length}
            </span>
          </div>

          {bugReports.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bug reports found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
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
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{report.reportedBy.name}</div>
                          <div className="text-sm text-gray-500">{report.reportedBy.email}</div>
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
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
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
                          <button
                            onClick={() => startEdit(report)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Edit size={16} className="mr-1" /> Edit
                          </button>
                        </td>
                      </tr>
                      {expandedReport === report._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-blue-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-semibold text-lg mb-3 text-gray-800">Description:</h3>
                                <p className="text-gray-700 whitespace-pre-line mb-4">{report.description}</p>
                                
                                {report.note && (
                                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-gray-800">Admin Notes:</h3>
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
                      {editingReport === report._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-green-50">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                              <h3 className="font-semibold text-lg mb-4 text-gray-800">Edit Bug Report</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <div className="relative">
                                      <select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleInputChange}
                                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
                                      >
                                        {statusOptions.map(option => (
                                          <option key={option} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <div className="relative">
                                      <select
                                        name="priority"
                                        value={editForm.priority}
                                        onChange={handleInputChange}
                                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
                                      >
                                        {priorityOptions.map(option => (
                                          <option key={option} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                    <textarea
                                      name="adminNotes"
                                      value={editForm.adminNotes}
                                      onChange={handleInputChange}
                                      rows="4"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                      placeholder="Add notes about this bug report"
                                    ></textarea>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-3 mt-4">
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateBugReport(report._id)}
                                  className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <CheckCircle size={16} className="mr-1" />
                                  Save Changes
                                </button>
                              </div>
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
    <FooterContainer/>
    </>
  );
};

export default BugReportsAdmin;