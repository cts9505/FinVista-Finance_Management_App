import React, { useState, useEffect, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

const ReportBugPage = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, isLoggedin } = useContext(AppContent);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deviceInfo: '',
    browserInfo: ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Get browser and device info automatically
    const browserInfo = `${navigator.userAgent}`;
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    const deviceInfo = `Screen: ${screenSize}, ${navigator.platform}`;
    
    setFormData(prev => ({
      ...prev,
      browserInfo,
      deviceInfo
    }));
    
    // Check if user is logged in
    // if (!isLoggedin) {
    //   toast.error('Please login to report a bug');
    //   navigate('/login');
    // }
  }, [isLoggedin, navigate]);

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
      
      setScreenshot(file);
      
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
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('deviceInfo', formData.deviceInfo);
      formDataToSend.append('browserInfo', formData.browserInfo);
      
      if (screenshot) {
        formDataToSend.append('screenshot', screenshot);
      }
      
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/report-bug`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (data.success) {
        toast.success('Bug report submitted successfully');
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          deviceInfo: formData.deviceInfo,
          browserInfo: formData.browserInfo
        });
        setScreenshot(null);
        setPreviewUrl('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error reporting bug:', error);
      toast.error(error.response?.data?.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-20 mt-2">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Report a Bug
            <p className='text-gray-500 text-xs'>Please don't Spam</p>
          </h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the issue"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide details about the bug. Include steps to reproduce if possible."
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="priority" className="block text-gray-700 font-medium mb-2">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="screenshot" className="block text-gray-700 font-medium mb-2">Screenshot (Optional)</label>
              <input
                type="file"
                id="screenshot"
                name="screenshot"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
              
              {previewUrl && (
                <div className="mt-3">
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="max-h-64 rounded-md border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshot(null);
                      setPreviewUrl('');
                    }}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Submitting...' : 'Submit Bug Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <FooterContainer />
    </div>
  );
};

export default ReportBugPage;