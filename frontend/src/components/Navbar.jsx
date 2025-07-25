import React, { useState, useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { useNavigate, NavLink } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import PropTypes from 'prop-types'

// Import icons (assuming you have these in your assets or can add them)
import { Menu, X, Bell, User,Loader ,LogOut, Settings, Mail, HelpCircle } from 'lucide-react'

const Navbar = ({ name = "Login" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef(null)
  const menuRef = useRef(null)
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);

  const navigate = useNavigate()
  const { userData, backendUrl, setUserData, setIsLoggedin, isLoggedin } = useContext(AppContent)

  // Check if navbar should be transparent or not
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      if (scrollPosition > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sendVerificationOtp = async () => {
  // If already loading, prevent additional clicks
  if (isVerificationLoading) {
    toast.info("Verification email is being sent, please wait...");
    return;
  }
  
  try {
    // Set loading state to true
    setIsVerificationLoading(true);
    
    axios.defaults.withCredentials = true;
    const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
    
    if (data.success) {
      navigate('/verify-email');
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  } catch (e) {
    toast.error(e.message);
  } finally {
    // Set loading state back to false after completion
    setIsVerificationLoading(false);
  }
};

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(backendUrl + '/api/auth/logout')
      if (data.success) {
        setIsLoggedin(false)
        setUserData(false)
        localStorage.removeItem('user-info')
        toast.success(data.message)
        navigate('/')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact-us' },
  ]

  return (
    <nav 
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md py-0.5' 
          : 'bg-transparent py-0.5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              onClick={() => navigate('/')} 
              src={assets.Logo1} 
              alt="FinVista" 
              className="w-22 sm:w-26 cursor-pointer transition-transform hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavLink 
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `text-base font-medium transition-all hover:text-blue-600 relative px-1 py-2 ${
                    isActive 
                      ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600' 
                      : 'text-gray-700'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Profile or Login Button */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell for logged in users */}

            
            {userData ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 flex justify-center items-center rounded-full bg-blue-100 text-blue-600 border-2 border-white shadow-md overflow-hidden transition-all hover:shadow-lg hover:scale-105">
                    {userData.image ? 
                      <img 
                        src={userData.image} 
                        alt={userData.name} 
                        className="w-full h-full object-cover" 
                      /> : 
                      <span className="text-sm font-semibold">{userData.name[0].toUpperCase()}</span>
                    }
                  </div>
                  {/* <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {userData.name?.split(' ')[0]}
                  </span> */}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{userData.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          navigate('/profile')
                          setShowProfileMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </button>
                      
                      {/* <button 
                        onClick={() => {
                          navigate('/settings')
                          setShowProfileMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings size={16} className="mr-2" />
                        Settings
                      </button> */}
                      
                      {!userData.isAccountVerified && (
                        <button 
                          onClick={() => {
                            sendVerificationOtp();
                          }}
                          disabled={isVerificationLoading}
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            isVerificationLoading 
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-blue-600 hover:bg-gray-100"
                          }`}
                        >
                          {isVerificationLoading ? (
                            <>
                              <Loader size={16} className="mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail size={16} className="mr-2" />
                              Verify Email
                            </>
                          )}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          navigate('/contact-us')
                          setShowProfileMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <HelpCircle size={16} className="mr-2" />
                        Help & Support
                      </button>
                    </div>
                    
                    <div className="py-1 border-t border-gray-100">
                      <button 
                        onClick={() => {
                          logout()
                          setShowProfileMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md"
              >
                {name}
                <img src={assets.arrow_icon} alt="arrow" className="w-4 h-4 filter brightness-0 invert" />
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden" ref={menuRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Mobile menu dropdown */}
              {isOpen && (
                <div className="absolute top-full right-0 left-0 bg-white shadow-lg mt-2 p-4 z-50 animate-slideDown">
                  <div className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => 
                          `block px-4 py-2 text-base font-medium rounded-md ${
                            isActive 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

Navbar.propTypes = {
  name: PropTypes.string,
}

export default Navbar