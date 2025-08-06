import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import { useNavigate, Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import FooterContainer from "../components/Footer.jsx";

const WaveDivider = ({ className }) => (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-20">
        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,117.3C96,139,192,181,288,181.3C384,181,480,139,576,144C672,149,768,203,864,208C960,213,1056,171,1152,160C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
  );

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Stats counter visibility
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

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Smart Budget Tracking",
      description: "AI-powered expense categorization with real-time alerts and predictive budgeting insights.",
      gradient: "from-blue-500 to-cyan-500",
      hoverColor: "blue"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Investment Intelligence",
      description: "Advanced portfolio analytics with machine learning recommendations and risk assessment.",
      gradient: "from-purple-500 to-pink-500",
      hoverColor: "purple"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Automated Reminders",
      description: "Never miss a payment with intelligent scheduling and multi-channel notifications.",
      gradient: "from-green-500 to-teal-500",
      hoverColor: "green"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Dynamic Reports",
      description: "Interactive financial reports with drill-down capabilities and exportable insights.",
      gradient: "from-orange-500 to-red-500",
      hoverColor: "orange"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Military-Grade Security",
      description: "Zero-knowledge encryption, biometric authentication, and blockchain-backed security.",
      gradient: "from-indigo-500 to-purple-500",
      hoverColor: "indigo"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Goal Achievement",
      description: "Gamified financial goals with milestone tracking and achievement rewards.",
      gradient: "from-yellow-500 to-orange-500",
      hoverColor: "yellow"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Tech Entrepreneur",
      image: "https://randomuser.me/api/portraits/women/17.jpg",
      quote: "Finvista transformed my startup's financial management. The AI insights helped me optimize cash flow and secure Series A funding.",
      rating: 5,
      company: "TechFlow Inc."
    },
    {
      name: "Michael Chen",
      role: "Investment Advisor",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "The portfolio analytics are incredibly sophisticated. I use Finvista to manage both personal and client investments with confidence.",
      rating: 5,
      company: "Wealth Dynamics"
    },
    {
      name: "Priya Patel",
      role: "Digital Nomad",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "Managing finances across multiple currencies and countries was a nightmare. Finvista made it seamless and automated.",
      rating: 5,
      company: "Remote Creative"
    }
  ];

  const stats = [
    { number: 250000, suffix: "+", label: "Active Users", icon: "👥" },
    { number: 15000000, suffix: "+", label: "Transactions Tracked", icon: "💸" },
    { number: 150, suffix: "M+", label: "Goals Achieved", icon: "🎯" },
    { number: 99.9, suffix: "%", label: "Uptime", icon: "⚡" }
  ];

  const faqs = [
    {
      question: "How does Finvista's AI technology work?",
      answer: "Our AI uses machine learning algorithms to analyze spending patterns, predict future expenses, and provide personalized financial recommendations. It continuously learns from your behavior to offer increasingly accurate insights while maintaining complete privacy."
    },
    {
      question: "Is my financial data truly secure?",
      answer: "Absolutely. We use bank-level 256-bit encryption, zero-knowledge architecture, and never store your actual banking credentials. All data is encrypted both in transit and at rest, with regular security audits by third-party experts."
    },
    {
      question: "Can I connect international accounts?",
      answer: "Yes! Finvista supports over 15,000 financial institutions across 40+ countries, with automatic currency conversion and real-time exchange rates for seamless global financial management."
    },
    {
      question: "What makes Finvista different from other apps?",
      answer: "Our advanced AI, comprehensive cross-platform integration, real-time collaboration features, and predictive analytics set us apart. Plus, we offer 24/7 human support and a 99.9% uptime guarantee."
    },
    {
      question: "How quickly can I get started?",
      answer: "Account setup takes less than 3 minutes. Our smart onboarding process automatically categorizes transactions and creates initial budgets based on your spending patterns within 24 hours."
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Counter component with enhanced animation
  const Counter = ({ value, duration = 2, suffix }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let start = 0;
      const end = parseInt(value);
      const incrementTime = (duration * 1000) / 100;
      const increment = Math.ceil(end / 100);
      
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(counter);
    }, [value, duration, isVisible]);

    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(0) + "K";
      return num.toString();
    };

    return (
      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
        {suffix === "%" ? count.toFixed(1) : formatNumber(count)}
        {suffix}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Floating Background Elements */}
      {/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 -right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -left-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div> */}

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
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 rounded-full text-sm font-semibold mb-6 border border-blue-500/20">
              ⚡ Powerful Features
            </span>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nothing You Don't
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary financial tools powered by cutting-edge AI and designed for the modern investor.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                onHoverStart={() => setActiveFeature(index)}
                onHoverEnd={() => setActiveFeature(null)}
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                {/* Gradient background overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Animated icon container */}
                <motion.div 
                  className={`relative z-10 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 w-16 h-16 flex items-center justify-center text-white mb-6 shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
                
                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)`
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section ref={statsRef} className="py-20 relative overflow-hidden">
        {/* Animated background 
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.3) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by Millions
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join a growing community of smart investors and financial enthusiasts.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  className="text-4xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="flex justify-center mb-2">
                  {isVisible && <Counter value={stat.number} suffix={stat.suffix} />}
                </div>
                <p className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from real people who've transformed their financial lives.
            </p>
          </motion.div>
          
          <div className="relative max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                index === currentTestimonial && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 lg:p-12">
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="lg:w-1/3">
                          <motion.div
                            className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-400 mx-auto"
                            whileHover={{ scale: 1.05 }}
                          >
                            <img 
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                          <div className="text-center mt-4">
                            <h4 className="text-xl font-bold text-gray-900">{testimonial.name}</h4>
                            <p className="text-blue-600 font-semibold">{testimonial.role}</p>
                            <p className="text-gray-500 text-sm">{testimonial.company}</p>
                          </div>
                        </div>
                        
                        <div className="lg:w-2/3 text-center lg:text-left">
                          <div className="flex justify-center lg:justify-start mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <motion.svg
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="w-6 h-6 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </motion.svg>
                            ))}
                          </div>
                          <blockquote className="text-xl lg:text-2xl text-gray-700 italic leading-relaxed mb-6">
                            "{testimonial.quote}"
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            
            {/* Navigation dots */}
            <div className="flex justify-center space-x-3 mt-8">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Finvista.
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <motion.button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <motion.svg
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-6 h-6 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>
                
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(45deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
                'linear-gradient(225deg, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
                'linear-gradient(45deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Transform
              <br />
              Your Financial Future?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of smart investors who are already using Finvista to build wealth and achieve their financial goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300"
              >
                <Link to="/login">
                <span className="flex items-center">
                  Start Free Trial
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                </Link>
              </motion.button>
              <Link to="contact-us">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition duration-300"
              >
                Schedule Demo
              </motion.button>
              </Link>
            </div>
            
            <div className="mt-8 text-blue-100">
              <p className="text-sm">✓ No credit card required  ✓ 14-day free trial  ✓ Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;