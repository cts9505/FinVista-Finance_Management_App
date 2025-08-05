import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LineChart, BarChart, Shield, Wallet, PieChart, Calendar, FileText, Lock, CreditCard, 
  Brain, UserCheck, BellRing, Upload, ChevronRight, Check, ArrowRight, ChevronLeft, ChevronDown, Bell
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';
import dashboardImg from '/dashboard.png';
import budgetImg from '/budget.png';
import chartImg from '/expense.png';
import ocrImg from '/ocr.png';
import aiImg from '/ai.png';
import billImg from '/bill.png';
import home from '/home.png';

const Features = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visibleSection, setVisibleSection] = useState('hero');
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const securityRef = useRef(null);
  const aiRef = useRef(null);
  const pricingRef = useRef(null);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const featureSliderRef = useRef(null);

  // Primary feature list
  const primaryFeatures = [
    {
      id: 'dashboard',
      title: 'User-Friendly Dashboard',
      icon: <LineChart className="text-blue-600" size={24} />,
      description: 'Seamless experience with React and Tailwind CSS. Track your finances at a glance with intuitive visualizations.',
      image: dashboardImg,
      benefits: [
        'Responsive design works on all devices', 
        'Real-time data updates', 
        'Customizable widgets and layout',
        'Seamless transitions between views'
      ]
    },
    {
      id: 'tracking',
      title: 'Comprehensive Financial Tracking',
      icon: <PieChart className="text-blue-600" size={24} />,
      description: 'Monitor daily, weekly, monthly, and annual income with detailed analysis shown through creative graphs.',
      image: chartImg,
      benefits: [
        'Income and expense categorization', 
        'Trend analysis across time periods', 
        'Export data to Excel for your CA',
        'Custom tagging for personalized tracking'
      ]
    },
    {
      id: 'budget',
      title: 'Flexible Budget Management',
      icon: <Wallet className="text-blue-600" size={24} />,
      description: 'Set up monthly budgets according to your preferences and track your spending against your goals.',
      image: budgetImg,
      benefits: [
        'Custom budget categories', 
        'Alerts for approaching limits', 
        'Progress visualization',
        'Automated spending suggestions'
      ]
    },
    {
      id: 'bills',
      title: 'Bill Tracking & Reminders',
      icon: <Calendar className="text-blue-600" size={24} />,
      description: 'Never miss a payment with our bill tracking system and customizable reminders.',
      image: billImg,
      benefits: [
        'Calendar view of upcoming bills', 
        'Email and push notifications', 
        'Recurring bill automation',
        'Payment history tracking'
      ]
    },
    {
      id: 'ocr',
      title: 'OCR Transaction Scanning',
      icon: <Upload className="text-blue-600" size={24} />,
      description: 'Our OCR system scans uploaded images of transaction history and automatically sorts them into income and expenses.',
      image: ocrImg,
      benefits: [
        'Automated receipt processing', 
        'High accuracy transaction categorization', 
        'Support for multiple formats',
        'Digital receipt storage'
      ]
    },
    {
      id: 'ai',
      title: 'AI-Powered Financial Advice',
      icon: <Brain className="text-blue-600" size={24} />,
      description: 'Premium users gain access to AI-generated financial advice based on their personal data patterns.',
      image: aiImg,
      benefits: [
        'Personalized saving recommendations', 
        'Investment insights', 
        'Spending pattern analysis',
        'Financial goal planning assistance'
      ]
    }
  ];

  // Security features
  const securityFeatures = [
    {
      title: 'Authenticated User Login',
      icon: <UserCheck size={24} className="text-blue-600" />,
      description: 'Secure login with welcome messages and email verification for user authenticity.'
    },
    {
      title: 'Advanced Security System',
      icon: <Shield size={24} className="text-blue-600" />,
      description: 'Receive email alerts when your account is accessed from a new device.'
    },
    {
      title: 'Encrypted Data Storage',
      icon: <Lock size={24} className="text-blue-600" />,
      description: 'All your financial data is encrypted and stored securely.'
    },
    {
      title: 'Secure Authentication',
      icon: <CreditCard size={24} className="text-blue-600" />,
      description: 'JWT token-based authentication with secure password hashing.'
    }
  ];

  // Pricing tiers
  const pricingTiers = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started with basic financial tracking',
      features: [
        'Income & expense tracking',
        'Basic dashboards',
        'Export to Excel',
        'Email support'
      ],
      button: 'Get Started',
      highlight: false
    },
    {
      name: 'Premium',
      price: '₹1',
      period: 'per month',
      description: 'Advanced features for detail-oriented financial management',
      features: [
        'Everything in Free',
        'OCR receipt scanning',
        'Unlimited budget categories',
        'AI-powered insights',
        'Priority support'
      ],
      button: 'Start Free Trial',
      highlight: true
    },
    
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "FinVista completely changed how I manage my money. The intuitive dashboard and AI insights have helped me save an extra ₹3000 monthly.",
      name: "Sarah T.",
      title: "Freelance Designer"
    },
    {
      quote: "The OCR feature is a game-changer! I no longer dread organizing receipts and tracking expenses. Everything is automated and categorized perfectly.",
      name: "Michael K.",
      title: "Small Business Owner"
    },
    {
      quote: "As someone who struggles with budgeting, FinVista's visual approach and reminder system have finally helped me stay on track and meet my savings goals.",
      name: "Jennifer P.",
      title: "Marketing Manager"
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: "Is my financial data secure with FinVista?",
      answer: "Absolutely. We employ bank-level security measures including encryption, two-factor authentication, and regular security audits. Your data is encrypted both in transit and at rest, and we never share your information with third parties without your explicit consent."
    },
    {
      question: "How accurate is the OCR feature for scanning receipts?",
      answer: "Our OCR technology has a high accuracy rate of over 95% for clearly photographed receipts. The system continuously improves through machine learning. For any discrepancies, you can easily make manual adjustments to ensure your data is always accurate."
    },
    {
      question: "Can I export my financial data?",
      answer: "Yes, FinVista allows you to export your financial data in multiple formats including Excel, CSV, and PDF. This feature is particularly useful for sharing information with your accountant or financial advisor."
    },
    {
      question: "What makes FinVista different from other financial apps?",
      answer: "FinVista stands out with its combination of user-friendly design, powerful AI-driven insights, and OCR technology. We focus on providing actionable financial intelligence rather than just tracking, helping you make better financial decisions every day."
    },
    {
      question: "Do I need to connect my bank accounts?",
      answer: "While connecting your accounts provides the most seamless experience, it's not required. FinVista allows manual tracking of income and expenses if you prefer not to link your financial institutions."
    }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = [
      { ref: heroRef, id: 'hero' },
      { ref: featuresRef, id: 'features' },
      { ref: securityRef, id: 'security' },
      { ref: aiRef, id: 'ai' },
      { ref: pricingRef, id: 'pricing' }
    ];

    sections.forEach(({ ref, id }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sections.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  // Feature slider navigation
  const handlePrevFeature = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const currentIndex = primaryFeatures.findIndex(feature => feature.id === activeTab);
    const prevIndex = currentIndex === 0 ? primaryFeatures.length - 1 : currentIndex - 1;
    setActiveTab(primaryFeatures[prevIndex].id);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handleNextFeature = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const currentIndex = primaryFeatures.findIndex(feature => feature.id === activeTab);
    const nextIndex = currentIndex === primaryFeatures.length - 1 ? 0 : currentIndex + 1;
    setActiveTab(primaryFeatures[nextIndex].id);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Scroll to feature tab
  const scrollToFeatureTab = (featureId) => {
    setActiveTab(featureId);
    if (featureSliderRef.current) {
      const tabElement = document.getElementById(`tab-${featureId}`);
      if (tabElement) {
        featureSliderRef.current.scrollLeft = tabElement.offsetLeft - 20;
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardHoverVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar/>
      {/* Hero Section */}
      <section 
        id="hero" 
        ref={heroRef}
        className="pt-22 md:pt-30 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="inline-block mb-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
              Personal Finance Management Reimagined
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Features</span> to Transform Your Finances
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              FinVista provides all the tools you need to track, manage, and optimize your personal finances with ease.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              Get Started Free
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                featuresRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition shadow-sm hover:shadow-md"
            >
              Explore Features
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-12 md:mt-16 flex justify-center"
          >
            <div className="relative w-full max-w-4xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transform rotate-1 blur-sm opacity-20"></div>
              <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden p-2">
                <img 
                  src={dashboardImg} // Replace with actual image path
                  alt="FinVista Dashboard"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 max-w-xs"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Bank-grade security keeps your financial data protected</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        ref={featuresRef}
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Master Your Money</span>
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
              Discover how FinVista's comprehensive suite of tools helps you track, manage, and grow your finances.
            </p>
          </motion.div>

          {/* Feature Tabs with Arrows */}
          <div className="relative mb-12">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevFeature}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:translate-x-0 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50"
            >
              <ChevronLeft size={20} />
            </motion.button>
            
            <div 
              ref={featureSliderRef}
              className="overflow-x-auto hide-scrollbar pb-4 mb-8 px-8 md:px-12"
            >
              <div className="flex min-w-max md:justify-center space-x-2 md:space-x-4">
                {primaryFeatures.map((feature) => (
                  <motion.button
                    id={`tab-${feature.id}`}
                    key={feature.id}
                    onClick={() => scrollToFeatureTab(feature.id)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-3 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
                      activeTab === feature.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {feature.icon}
                    <span className="font-medium text-sm md:text-base">{feature.title}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextFeature}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-0 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Feature Content */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <AnimatePresence mode="wait">
              {primaryFeatures.map((feature) => (
                activeTab === feature.id && (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                  >
                    <div className="inline-block mb-4 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {feature.id === 'ai' ? 'Premium Feature' : 'Core Feature'}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                    
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="flex items-start gap-3"
                        >
                          <span className="flex-shrink-0 mt-1 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-blue-600" />
                          </span>
                          <span className="text-gray-700">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* Feature Image */}
            <AnimatePresence mode="wait">
              {primaryFeatures.map((feature) => (
                activeTab === feature.id && (
                  <motion.div 
                    key={feature.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-4 md:p-8 rounded-2xl shadow-xl order-first md:order-last group"
                  >
                    <div className="overflow-hidden rounded-xl relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-auto rounded-xl shadow-md transform group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center mt-10">
            <div className="flex space-x-2">
              {primaryFeatures.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => scrollToFeatureTab(feature.id)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeTab === feature.id ? 'w-6 bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to ${feature.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              See <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">FinVista</span> in Action
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Interact with our demo dashboard to experience the power and simplicity of FinVista firsthand.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-blue-50 rounded-3xl p-6 md:p-12 shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2">
                <motion.div 
                  whileHover={cardHoverVariants.hover}
                  initial={cardHoverVariants.initial}
                  className="bg-white rounded-xl p-6 shadow-md"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <LineChart size={20} className="text-blue-600" />
                    Financial Overview
                  </h3>
                  <div className="h-64 md:h-80 bg-gray-50 rounded-lg overflow-hidden relative">
                    {/* Interactive chart mockup */}
                    <div className="absolute inset-0 flex items-end justify-between px-6 pb-6">
                      {[35, 50, 30, 70, 45, 60, 40, 65, 55, 75, 50, 80].map((height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="w-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-between px-5 text-xs text-gray-500">
                      <span>Jan</span>
                      <span>Dec</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="w-full md:w-1/2 space-y-6">
                <motion.div
                  whileHover={cardHoverVariants.hover}
                  initial={cardHoverVariants.initial}
                  className="bg-white rounded-xl p-6 shadow-md"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Wallet size={20} className="text-blue-600" />
                    Monthly Budget
                  </h3>
                  <div className="space-y-4">
                    {[
                      { category: 'Food & Dining', spent: 420, budget: 500, percent: 84 },
                      { category: 'Housing', spent: 1200, budget: 1500, percent: 80 },
                      { category: 'Transportation', spent: 280, budget: 400, percent: 70 },
                      { category: 'Entertainment', spent: 150, budget: 300, percent: 50 }
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.category}</span>
                          <span>₹{item.spent} / ₹{item.budget}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percent}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className={`h-full ${
                              item.percent > 90 ? 'bg-red-500' : 
                              item.percent > 75 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={cardHoverVariants.hover}
                  initial={cardHoverVariants.initial}
                  className="bg-white rounded-xl p-6 shadow-md"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BellRing size={20} className="text-blue-600" />
                    Upcoming Bills
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Netflix', date: 'May 15', amount: '₹14.99', icon: '📺' },
                      { name: 'Rent', date: 'May 18', amount: '₹1,200', icon: '🏠' },
                      { name: 'Electric Bill', date: 'May 22', amount: '₹78.35', icon: '⚡' }
                    ].map((bill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-lg">
                            {bill.icon}
                          </div>
                          <div>
                            <div className="font-medium">{bill.name}</div>
                            <div className="text-xs text-gray-500">{bill.date}</div>
                          </div>
                        </div>
                        <div className="font-semibold">{bill.amount}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section 
        id="security" 
        ref={securityRef}
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white"
      >
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
              Bank-Grade Protection
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Financial Data is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Completely Secure</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              FinVista employs cutting-edge security measures to ensure your financial information is protected at all times.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={cardHoverVariants.hover}
                initial={cardHoverVariants.initial}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
{/* 
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-16 bg-blue-600 text-white p-8 rounded-2xl shadow-xl"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">We take your privacy seriously</h3>
                <p className="mb-6">
                  Our security protocols exceed industry standards. Your data is encrypted end-to-end and we never share your financial information with third parties without your explicit consent.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition shadow-md"
                >
                  Learn more about our security
                </motion.button>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield size={64} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div> */}
        </div>
      </section>

      {/* AI Tools Section */}
      <section 
        id="ai" 
        ref={aiRef}
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
              Premium Feature
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI-Powered</span> Financial Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our advanced AI analyzes your spending patterns to provide personalized recommendations and insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <img 
                src={aiImg}
                alt="AI-Powered Financial Tools"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">Smart Financial Analysis</h3>
                <p className="text-gray-600">
                  Our AI engine analyzes your income and spending patterns to identify opportunities for savings and investment. Get personalized recommendations based on your financial goals.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Predictive Budgeting</h3>
                <p className="text-gray-600">
                  Anticipate future expenses with our predictive budgeting tool. The AI forecasts your spending based on historical data and helps you plan accordingly.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Automated Categorization</h3>
                <p className="text-gray-600">
                  Never manually categorize transactions again. Our AI accurately identifies and categorizes your transactions, saving you time and effort.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/upgrade')}
                className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md flex items-center gap-2"
              >
                <Brain size={20} />
                Unlock AI Features with Premium
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Thousands</span> of Users
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Here's what some of our users have to say about their experience with FinVista.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={cardHoverVariants.hover}
                initial={cardHoverVariants.initial}
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.title}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        id="pricing" 
        ref={pricingRef}
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Choose the Right <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Plan</span> for You
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you're an individual looking to better manage your personal finances or a business owner, we have the perfect plan for you.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={cardHoverVariants.hover}
                initial={cardHoverVariants.initial}
                className={`rounded-2xl overflow-hidden ${
                  tier.highlight 
                    ? 'bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-xl ring-4 ring-blue-100' 
                    : 'bg-white text-gray-900 shadow-lg'
                }`}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className={`ml-2 ${tier.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                      {tier.period}
                    </span>
                  </div>
                  <p className={`mb-8 ${tier.highlight ? 'text-blue-100' : 'text-gray-600'}`}>
                    {tier.description}
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`flex-shrink-0 mt-1 w-5 h-5 ${
                          tier.highlight ? 'bg-blue-500' : 'bg-blue-100'
                        } rounded-full flex items-center justify-center`}>
                          <Check size={12} className={tier.highlight ? 'text-white' : 'text-blue-600'} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`px-8 pb-8 ${tier.highlight ? '' : 'border-t border-gray-200 pt-8'}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-lg font-medium ${
                      tier.highlight
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition shadow-md`}
                  >
                    {tier.button}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Questions</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to the most common questions about FinVista.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-3xl mx-auto"
          >
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-lg">{item.question}</span>
                    <ChevronDown 
                      size={20}
                      className={`text-blue-600 transition-transform ${
                        selectedFaq === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {selectedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-gray-600">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-xl mb-10 text-blue-100">
              Join thousands of users who have already improved their financial well-being with FinVista.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition shadow-lg font-medium"
              >
                <Link to="/login">
                Sign Up Free
                </Link>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition shadow-lg border border-blue-400 font-medium"
              >
                <Link to="/login">
                Schedule a Demo
                </Link>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <FooterContainer/>
    </div>
  );
};

export default Features;