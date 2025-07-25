import React, { useState, useEffect, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

const ContactUsPage = () => {
  const { backendUrl } = useContext(AppContent);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [trackEmail, setTrackEmail] = useState('');
  const [trackingResults, setTrackingResults] = useState(null);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'security', label: 'Security Concern' },
    { value: 'account', label: 'Account Issue' },
    { value: 'sales', label: 'Sales & Pricing' },
    { value: 'support', label: 'Technical Support' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      
      if (image) {
        formDataToSend.append('image', image);
      }
      
      const { data } = await axios.post(
        `${backendUrl}/api/auth/submit`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (data.success) {
        toast.success(data.message);
        setFormData({
          name: '',
          email: '',
          category: 'general',
          subject: '',
          message: ''
        });
        setImage(null);
        setPreviewUrl('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(error.response?.data?.message || 'Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackEmail) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/track`, {
        params: { email: trackEmail }
      });
      
      if (data.success) {
        setTrackingResults(data.data);
        if (data.data.length === 0) {
          toast.info('No contact requests found for this email');
        } else {
          // Show the popup when results are found
          setShowPopup(true);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error tracking contact requests:', error);
      toast.error(error.response?.data?.message || 'Error retrieving your contact requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12 mt-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Have questions or need assistance? We're here to help. Fill out the form below and our team will get back to you as soon as possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-gray-700">Email</h3>
                      <p className="text-gray-600">finvistafinancemanagementapp<br></br>@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-gray-700">Phone</h3>
                      <p className="text-gray-600">+91 9373954169</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-gray-700">Address</h3>
                      <p className="text-gray-600">Pune - 411044<br /> Maharashtra, India</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Hours</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between">
                    <span>All days:</span>
                    <span>9:00 AM - 9:00 PM</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowTrackingForm(!showTrackingForm)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {showTrackingForm ? 'Hide Tracking Form' : 'Track Your Request'}
                </button>
                
                {showTrackingForm && (
                  <div className="mt-4 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Track Your Contact Request</h3>
                    <form onSubmit={handleTrackSubmit}>
                      <div className="mb-4">
                        <label htmlFor="trackEmail" className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          id="trackEmail"
                          value={trackEmail}
                          onChange={(e) => setTrackEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
                      >
                        {loading ? 'Processing...' : 'Track Requests'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Subject of your message"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide details about your inquiry or issue..."
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
                      Attachment (Optional)
                      <span className="text-sm font-normal text-gray-500 ml-2">- Screenshots or relevant documents</span>
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
                    
                    {previewUrl && (
                      <div className="mt-3">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setPreviewUrl('');
                          }}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:bg-blue-400"
                    >
                      {loading ? 'Submitting...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How long does it take to get a response?</h3>
                <p className="text-gray-600">We aim to respond to all inquiries within 24-48 business hours. For urgent matters, please indicate this in your subject line.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I track the status of my request?</h3>
                <p className="text-gray-600">Yes, you can track the status of your request by clicking the "Track Your Request" button and entering the email address you used to submit your inquiry.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Do I need to create an account?</h3>
                <p className="text-gray-600">No, you don't need an account to submit a contact request. However, creating an account gives you easier access to track all your support interactions.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What information should I include?</h3>
                <p className="text-gray-600">Please provide as much relevant information as possible about your inquiry or issue. Screenshots or error messages are particularly helpful for technical issues.</p>
              </div>
            </div>
          </div>
          
          {/* Map Section */}
          {/* <div className="mt-16">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Visit Our Office</h2>
              <div className="h-96 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Map location would appear here</p>
                  <p className="text-sm mt-2">Replace this placeholder with your preferred map service embed</p>
                </div>
              </div>
            </div>
          </div> */}

        </div>
      </div>
      
      {/* Popup Overlay for Tracking Results */}
      {showPopup && trackingResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Your Contact Requests</h2>
              <button 
                onClick={() => {
                  setShowPopup(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex h-[calc(90vh-120px)]">
              {/* Requests List */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4">
                {trackingResults.map(request => (
                  <div 
                    key={request._id} 
                    onClick={() => handleRequestClick(request)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedRequest && selectedRequest._id === request._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-800 truncate capitalize">{request.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBadgeClass(request.status)} ml-2 whitespace-nowrap`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate capitalize">{request.message.substring(0, 60)}...</p>
                    
                    <p className="text-xs text-gray-500 mt-2">{formatDate(request.createdAt)}</p>
                  </div>
                ))}
              </div>
              
              {/* Request Details */}
              <div className="w-2/3 overflow-y-auto p-6">
                {selectedRequest ? (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-800 capitalize">{selectedRequest.subject}</h2>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadgeClass(selectedRequest.status)} font-medium`}>
                          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Submitted on {formatDate(selectedRequest.createdAt)}</p>
                        <p>Category: {getCategoryLabel(selectedRequest.category)}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="font-medium text-gray-700 mb-2">Message</h3>
                      <p className="text-gray-600 whitespace-pre-line capitalize">{selectedRequest.message}</p>
                    </div>
                    
                    
                    {selectedRequest.adminNotes && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 className="font-medium text-gray-700 mb-2">Response from Support</h3>
                        <p className="text-gray-600 capitalize">{selectedRequest.adminNotes}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {selectedRequest.resolvedAt && `Responded on ${formatDate(selectedRequest.resolvedAt)}`}
                        </p>
                      </div>
                    )}

                    {selectedRequest.imageUrl && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-700 mb-2">Attachment</h3>
                        <div className="border border-gray-200 rounded-lg p-2 inline-block">
                          <img 
                            src={selectedRequest.imageUrl} 
                            alt="Attachment" 
                            className="max-h-64 rounded" 
                          />
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p>Select a request to view details</p>
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>
      )}
      
      <FooterContainer />
    </div>
  );
};

export default ContactUsPage;