import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import FooterContainer from "../components/Footer.jsx";

// Import icons or you can use your own assets
const FeatureIcon = ({ children }) => (
  <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center text-blue-600">
    {children}
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { userData, isLoggedin } = useContext(AppContent);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.backgroundPositionY = `${scrollY * 0.5}px`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation trigger for stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Sample data
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Budget Tracking",
      description: "Track your expenses, set budgets, and get real-time alerts when you're overspending."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Investment Analytics",
      description: "Track portfolio performance, analyze investments, and get personalized recommendations."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Bill Reminders",
      description: "Never miss a payment with automated bill reminders and payment tracking."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "Financial Reports",
      description: "Generate comprehensive reports to understand your spending habits and financial health."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Bank-Level Security",
      description: "Your financial data is protected with industry-standard encryption and security measures."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: "Goal Setting",
      description: "Set financial goals and track your progress with visual indicators and milestones."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      image: "https://randomuser.me/api/portraits/women/17.jpg",
      quote: "Finvista has transformed how I manage my business finances. The dashboard gives me a clear picture of my cash flow and helps me make informed decisions."
    },
    {
      name: "Michael Chen",
      role: "Freelance Developer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "As someone who juggles multiple income streams, Finvista's categorization features save me hours of work each month. The tax reporting feature is a lifesaver!"
    },
    {
      name: "Priya Patel",
      role: "Marketing Executive",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "The budgeting tools have helped me save more than ever before. I love how I can visualize my spending patterns and adjust accordingly."
    }
  ];

  const pricing = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "Expense Tracking",
        "Basic Budgeting",
        "Limited Reports",
        "Single Device"
      ],
      recommended: false,
      buttonText: "Get Started"
    },
    {
      name: "Pro",
      price: "₹1",
      period: "monthly",
      features: [
        "Everything in Basic",
        "Investment Tracking",
        "Bill Reminders",
        "Unlimited Reports",
        "Multiple Devices"
      ],
      recommended: true,
      buttonText: "Try Free for 7 Days"
    },
  ];

  const stats = [
    { number: 100000, suffix: "+", label: "Users" },
    { number: 5000000, suffix: "+", label: "Transactions Tracked" },
    { number: 50, suffix: "M+", label: "Budget Goals Achieved" }
  ];

  // Animation for counting up numbers
  const Counter = ({ value, duration = 2, suffix }) => {
    const [count, setCount] = useState(0);
  
    useEffect(() => {
      if (!isVisible) return;
  
      let start = 0;
      const end = parseInt(value);
      const incrementTime = (duration * 1000) / end;
      const counter = setInterval(() => {
        start += Math.ceil(end / 100);
        setCount(start);
  
        if (start >= end) {
          clearInterval(counter);
          setCount(end);
        }
      }, incrementTime);
  
      return () => clearInterval(counter);
    }, [value, duration, isVisible]); // Changed 'end' to 'value' in dependencies
  
    // Format number with commas
    const formatNumber = (num) => {
      return num >= 1000000
        ? (num / 1000000).toFixed(1) + "M"
        : num >= 1000
        ? (num / 1000).toFixed(0) + "K"
        : num;
    };
  
    return (
      <span className="text-4xl font-bold text-blue-600">
        {formatNumber(count)}
        {suffix}
      </span>
    );
  };

  // SVG wave divider
  const WaveDivider = ({ className }) => (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-20">
        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,117.3C96,139,192,181,288,181.3C384,181,480,139,576,144C672,149,768,203,864,208C960,213,1056,171,1152,160C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
  );

  return (
    <>
      {/* Navigation Bar */}
      

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="pt-38 pb-20 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden"
      >
        {/* Background Patterns */}
        <div className="absolute top-20 -right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-40 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Financial Freedom Starts with <span className="text-blue-600">Finvista</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Track, manage, and grow your wealth with our comprehensive financial management platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
                >
                  Start For Free
                </button>
                <a 
              
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                    featuresRef.current.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center"
                >
                  Learn More
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
              
              <div className="mt-10 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img 
                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i * 10 + 2}.jpg`}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="ml-4 text-sm text-gray-600">
                  Trusted by <span className="font-medium text-gray-900">100,000+</span> users worldwide
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:w-1/2"
            >
              <div className="bg-white p-4 rounded-2xl shadow-2xl rotate-2 transform hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Portfolio Overview</h3>
                  <div className="flex flex-col space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">Total Assets</span>
                        <span className="text-xl font-bold text-blue-600">₹124,500</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Investments</p>
                            <p className="text-lg font-semibold text-gray-800">₹84,200</p>
                          </div>
                          <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">+12.4%</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Savings</p>
                            <p className="text-lg font-semibold text-gray-800">₹40,300</p>
                          </div>
                          <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">+3.2%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <h4 className="font-medium text-gray-800 mb-2">Upcoming Bills</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Rent</span>
                          <span className="font-medium">₹1,800 • May 31</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Utilities</span>
                          <span className="font-medium">₹240 • Jun 05</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Car Insurance</span>
                          <span className="font-medium">₹180 • Jun 15</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <WaveDivider className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Powerful Features to Manage Your Finances
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Everything you need to take control of your money, all in one place.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        <div className="absolute top-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-20">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,144C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,181.3C1248,192,1344,160,1392,144L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center">
                  {isVisible && <Counter value={stat.number} suffix={stat.suffix} />}
                </div>
                <p className="mt-2 text-xl font-medium text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 transform rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-20">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,144C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,181.3C1248,192,1344,160,1392,144L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              What Our Users Say
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Join thousands who have transformed their financial lives with Finvista.
            </motion.p>
          </div>
          
          <div className="relative h-96 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                index === currentTestimonial && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-lg p-6 md:p-8"
                  >
                    <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-100">
                        <img 
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:w-2/3 md:pl-8">
                      <svg className="w-10 h-10 text-blue-100 mb-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"></path>
                      </svg>
                      <p className="text-gray-600 text-lg mb-4 italic">{testimonial.quote}</p>
                      <h4 className="text-xl font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-blue-600">{testimonial.role}</p>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 pb-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Choose the plan that works best for your financial needs.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden ${plan.recommended ? 'ring-2 ring-blue-600 transform scale-105 md:-translate-y-2' : ''}`}
              >
                {plan.recommended && (
                  <div className="bg-blue-600 text-white text-center py-2 font-medium">
                    Recommended
                  </div>
                )}
                
                <div className="p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="ml-1 text-xl font-medium text-gray-500">/{plan.period}</span>}
                  </div>
                  
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <button
                      onClick={() => navigate('/login')}
                      className={`w-full py-3 px-4 rounded-lg font-medium ${
                        plan.recommended 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      } transition duration-300`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              Everything you need to know about Finvista.
            </motion.p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                question: "How secure is Finvista?",
                answer: "Finvista uses bank-level 256-bit encryption to protect your data. We implement two-factor authentication, regular security audits, and never store your banking credentials on our servers."
              },
              {
                question: "Can I connect all my financial accounts?",
                answer: "Yes, Finvista integrates with over 12,000 financial institutions worldwide, allowing you to connect checking, savings, credit cards, loans, investments, and more."
              },
              {
                question: "Is there a mobile app?",
                answer: "Absolutely! Finvista offers both iOS and Android apps that sync with the web version, allowing you to manage your finances on the go."
              },
              {
                question: "How does the free plan compare to paid plans?",
                answer: "The free plan offers basic expense tracking and budgeting features. Paid plans include additional features like investment tracking, bill reminders, unlimited report generation, and priority customer support."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. Your plan will continue until the end of the current billing cycle."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        <div className="absolute top-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-20">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,144C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,181.3C1248,192,1344,160,1392,144L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Ready to Take Control of Your Finances?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-xl text-blue-100"
            >
              Join thousands of users who have transformed their financial future with Finvista.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8"
            >
              <button 
                onClick={() => navigate('/upgrade')}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              >
                Start Your Free Trial
              </button>
              <p className="mt-4 text-blue-100 text-sm">No credit card required. 7-day free trial.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;