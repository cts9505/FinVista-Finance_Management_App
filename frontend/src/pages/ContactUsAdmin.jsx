import React, { useState, useEffect, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

const AdminContactDashboard = () => {
  const { backendUrl, isLoggedin, userData } = useContext(AppContent);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNotes: ''
  });

  useEffect(() => {
    checkAdminAndLoadData();
  }, [backendUrl, isLoggedin]);

  const checkAdminAndLoadData = async () => {
    if (!isLoggedin) {
      toast.error('Please login to access this page');
      return;
    }

    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const adminCheck = await axios.get(`${backendUrl}/api/auth/check-admin`);
      
      if (adminCheck.data.success && adminCheck.data.isAdmin) {
        setIsAdmin(true);
        await fetchContacts();
      } else {
        toast.error('You do not have permission to view this page');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast.error('Error verifying admin privileges');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/admin/all`);
      if (data.success) {
        setContacts(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error loading contact requests');
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setUpdateData({
      status: contact.status,
      adminNotes: contact.adminNotes || ''
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;

    setLoading(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/auth/admin/${selectedContact._id}`,
        updateData
      );

      if (data.success) {
        toast.success('Contact request updated successfully');
        // Update the contact in the state
        setContacts(contacts.map(c => 
          c._id === selectedContact._id ? { ...c, ...updateData } : c
        ));
        setSelectedContact({ ...selectedContact, ...updateData });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Error updating contact request');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'account':
        return 'bg-purple-100 text-purple-800';
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'support':
        return 'bg-blue-100 text-blue-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    const matchesSearch = 
      searchQuery === '' || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8 mt-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Contact Requests Dashboard</h1>
          <p className="text-gray-600">Manage and respond to customer inquiries</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
              
              <div className="mb-4">
                <label htmlFor="searchQuery" className="block text-gray-700 text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name, email, subject..."
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="filterStatus" className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="filterCategory" className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <select
                  id="filterCategory"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="general">General Inquiry</option>
                  <option value="security">Security Concern</option>
                  <option value="account">Account Issue</option>
                  <option value="sales">Sales & Pricing</option>
                  <option value="support">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterCategory('all');
                    setSearchQuery('');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {contacts.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-800">In Progress</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {contacts.filter(c => c.status === 'in-progress').length}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {contacts.filter(c => c.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Requests</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredContacts.length} of {contacts.length} requests
                </p>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No contact requests found matching your filters</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => (
                      <div 
                        key={contact._id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedContact?._id === contact._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-800">{contact.subject}</h3>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(contact.status)}`}>
                              {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeClass(contact.category)}`}>
                              {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            From: {contact.name} ({contact.email})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(contact.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected Contact Details */}
        {selectedContact && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{selectedContact.subject}</h2>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(selectedContact.status)}`}>
                  {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeClass(selectedContact.category)}`}>
                  {selectedContact.category.charAt(0).toUpperCase() + selectedContact.category.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Contact Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><span className="font-medium">Name:</span> {selectedContact.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedContact.email}</p>
                    <p><span className="font-medium">Submitted:</span> {formatDate(selectedContact.createdAt)}</p>
                    {selectedContact.resolvedAt && (
                      <p><span className="font-medium">Resolved:</span> {formatDate(selectedContact.resolvedAt)}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Message</h3>
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
                
                {selectedContact.imageUrl && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Attachment</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <a 
                        href={selectedContact.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        View Attachment
                      </a>
                      <img 
                        src={selectedContact.imageUrl} 
                        alt="Attachment" 
                        className="mt-2 max-h-48 rounded-md border border-gray-300" 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <form onSubmit={handleUpdateContact}>
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Update Status</h3>
                    <select
                      name="status"
                      value={updateData.status}
                      onChange={handleUpdateChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Admin Notes</h3>
                    <textarea
                      name="adminNotes"
                      value={updateData.response}
                      onChange={handleUpdateChange}
                      rows="8"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add internal notes about this request..."
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:bg-blue-400"
                    >
                      {loading ? 'Updating...' : 'Update Request'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                      className="bg-green-600 hover:bg-green-700 text-white text-center font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Email Customer
                    </a>
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <FooterContainer />
    </div>
  );
};

export default AdminContactDashboard;