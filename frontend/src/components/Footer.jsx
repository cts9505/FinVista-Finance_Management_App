import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import validator from 'validator';
const FooterContainer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const  handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validator.isEmail(email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/subscribe-newsletter`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response data:', response.data);
      if (response.data.success) {
        toast.success('Successfully subscribed to newsletter!');
        setEmail('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error subscribing to newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white text-gray-600 pt-8 pb-6 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
          {/* About Section */}
          <div className="md:col-span-1 lg:col-span-1">
            <img src={assets.Logo1} alt="FinVista Logo" className="w-32 mb-4" />
            <p className="text-sm mb-4 text-gray-500">
              Securely manage your finances with ease. Track, budget, and grow your wealth.
            </p>
            <div className="mt-4">
              <h3 className="text-gray-800 font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4 mb-4">
                <a href="https://github.com/cts9505" className="text-gray-400 hover:text-black" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.302 
                    3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 
                    0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 
                    17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 
                    1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 
                    1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.335-5.466-5.93 
                    0-1.31.47-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 
                    0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 
                    2.045.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23 
                    .653 1.653.242 2.873.118 3.176.77.84 
                    1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 
                    5.92.43.372.823 1.102.823 2.222 0 1.606-.015 
                    2.896-.015 3.286 0 .32.218.694.825.576C20.565 
                    22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 
                    .297z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/chaitanya-shinde-computer/" className="text-gray-400 hover:text-blue-600" aria-label="LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                </a>
                <a href="https://x.com/chaitanya_9505" className="text-gray-400 hover:text-blue-400" aria-label="Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                
                <a href="https://www.instagram.com/_chaitanya_.9505/" className="text-gray-400 hover:text-pink-500" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard</Link></li>
              <li><Link to="/budgets" className="hover:text-blue-500 transition-colors">Budgets</Link></li>
              <li><Link to="/expenses" className="hover:text-blue-500 transition-colors">Expenses</Link></li>
              <li><Link to="/incomes" className="hover:text-blue-500 transition-colors">Income</Link></li>
              <li><Link to="/bills" className="hover:text-blue-500 transition-colors">Bills</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-500 transition-colors">Try Premium</Link></li>
              <li><Link to="/sitemap" className="hover:text-blue-500 transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Legal & Contact</h3>
            <ul className="space-y-2">
              <li><Link to='/privacy-policy' className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to='/terms-and-condition' className="hover:text-blue-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link to='/refund-and-cancellation' className="hover:text-blue-500 transition-colors">Refund & Cancellation Policy</Link></li>
              <li><Link to='/contact-us' className="hover:text-blue-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/rating-and-reviews" className="hover:text-blue-500 transition-colors">Reviews</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Pune, Maharashtra</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <a href="mailto:finvistafinancemanagementapp@gmail.com" className="hover:text-blue-500 transition-colors break-words">
                  finvistafinancemanagement@gmail.com
                </a>
              </li>
              {/* <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <a href="tel:+1-800-123-4567" className="hover:text-blue-500 transition-colors">+1-800-123-4567</a>
              </li> */}
            </ul>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Subscribe to our newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="bg-gray-50 border border-gray-300 text-sm rounded-l px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-r transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            </div>
            <Link to="/bug-report" className="text-sm text-gray-500 hover:text-blue-500 transition-colors mt-4">
            <a href="#" className="text-blue-500 hover:text-blue-600 flex items-center mt-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              Report a bug
            </a>
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {currentYear} FinVista. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Made with ❤️ by Chaitanya & Team FinVista.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterContainer;