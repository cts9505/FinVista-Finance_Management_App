import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Brain, 
  Activity, 
  PieChart, 
  Calendar, 
  TrendingUp,
  Shield,
  Users,
  Star,
  Menu,
  X,
  BarChart3,
  Zap,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';
import FooterContainer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    users: 0,
    savings: 0,
    transactions: 0
  });
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Animate numbers on mount
  useEffect(() => {
    const animateNumber = (target, key, duration) => {
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedNumbers(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, duration / steps);
    };

    // Delay the animation slightly for better effect
    setTimeout(() => {
      animateNumber(10000, 'users', 2000);
      animateNumber(25000, 'savings', 2500);
      animateNumber(500000, 'transactions', 3000);
    }, 500);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Software Engineer",
      content: "AI Finance Pro helped me save ₹20,000 in just 3 months. The AI insights are incredibly accurate!",
      rating: 5,
      avatar: "RK"
    },
    {
      name: "Priya Sharma",
      role: "Marketing Manager",
      content: "The automated bill tracking is a game-changer. I never miss payments anymore and my credit score improved!",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Amit Patel",
      role: "Business Owner",
      content: "Best financial app I've used. The reports help me understand my business expenses like never before.",
      rating: 5,
      avatar: "AP"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations based on your spending patterns and financial goals.",
      color: "blue"
    },
    {
      icon: PieChart,
      title: "Smart Budget Management",
      description: "Create intelligent budgets that adapt to your lifestyle and spending habits.",
      color: "green"
    },
    {
      icon: Calendar,
      title: "Bill Tracking & Reminders",
      description: "Never miss a payment with automated bill tracking and smart notifications.",
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Visualize your financial health with comprehensive reports and trend analysis.",
      color: "orange"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is protected with 256-bit encryption and industry-standard security.",
      color: "red"
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Instantly sync across all devices with real-time updates and notifications.",
      color: "yellow"
    }
  ];

  const pricingFeatures = [
    "AI-powered financial insights",
    "Unlimited transactions",
    "Advanced budget management",
    "Bill tracking & reminders",
    "Custom reports & analytics",
    "Multi-device sync",
    "Priority customer support",
    "Data export capabilities"
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-10deg) scale(0.8);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-custom {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-slideInFromTop {
          animation: slideInFromTop 0.8s ease-out forwards;
        }

        .animate-rotateIn {
          animation: rotateIn 0.8s ease-out forwards;
        }

        .animate-delay-100 {
          animation-delay: 0.1s;
        }

        .animate-delay-200 {
          animation-delay: 0.2s;
        }

        .animate-delay-300 {
          animation-delay: 0.3s;
        }

        .animate-delay-400 {
          animation-delay: 0.4s;
        }

        .animate-delay-500 {
          animation-delay: 0.5s;
        }

        .animate-delay-600 {
          animation-delay: 0.6s;
        }

        .initial-hidden {
          opacity: 0;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          padding: 2px;
          border-radius: 16px;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 2px;
          background: white;
          border-radius: 14px;
          z-index: -1;
        }
      `}</style>

      {/* Navigation with slide-in animation */}
      <Navbar/>

      {/* Hero Section with staggered animations */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20" data-animate id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8 initial-hidden animate-fadeInUp">
              <Sparkles className="mr-2 animate-float" size={16} />
              Now with Advanced AI Insights
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 initial-hidden animate-fadeInUp animate-delay-100">
              Master Your Money with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI Intelligence</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto initial-hidden animate-fadeInUp animate-delay-200">
              Transform your financial life with personalized AI recommendations, smart budgeting, and automated insights that help you save more and spend smarter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 initial-hidden animate-fadeInUp animate-delay-300">
              <Link to="/login">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl">
                Start Free Trial <ArrowRight className="ml-2" size={20} />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all hover:scale-105">
                Watch Demo
              </button>
              </Link>
            </div>
            
            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center initial-hidden animate-scaleIn animate-delay-400">
                <div className="text-3xl font-bold text-blue-600 mb-1">{animatedNumbers.users.toLocaleString()}+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
              <div className="text-center initial-hidden animate-scaleIn animate-delay-500">
                <div className="text-3xl font-bold text-green-600 mb-1">₹{animatedNumbers.savings.toLocaleString()}+</div>
                <div className="text-gray-600">Average Savings</div>
              </div>
              <div className="text-center initial-hidden animate-scaleIn animate-delay-600">
                <div className="text-3xl font-bold text-purple-600 mb-1">{animatedNumbers.transactions.toLocaleString()}+</div>
                <div className="text-gray-600">Transactions Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Dashboard Preview with enhanced animations */}
      <section className="py-20 bg-gray-50" data-animate id="dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 ${visibleSections.has('dashboard') ? 'animate-fadeInUp' : 'initial-hidden'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See Your Financial Future Clearly
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a glimpse of our intuitive dashboard and powerful analytics that make financial management effortless.
            </p>
          </div>
          
          {/* Mock Dashboard with staggered card animations */}
          <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto hover-lift ${visibleSections.has('dashboard') ? 'animate-scaleIn animate-delay-200' : 'initial-hidden'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance Card */}
              <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl hover-lift ${visibleSections.has('dashboard') ? 'animate-fadeInLeft animate-delay-300' : 'initial-hidden'}`}>
                <h3 className="text-lg font-medium mb-2">Total Balance</h3>
                <div className="text-3xl font-bold mb-4">₹1,25,450</div>
                <div className="flex items-center text-blue-200">
                  <TrendingUp size={16} className="mr-2 animate-float" />
                  <span className="text-sm">+12.5% this month</span>
                </div>
              </div>
              
              {/* Savings Goal */}
              <div className={`bg-white border border-gray-200 p-6 rounded-xl hover-lift ${visibleSections.has('dashboard') ? 'animate-fadeInUp animate-delay-400' : 'initial-hidden'}`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Savings Goal</h3>
                <div className="text-2xl font-bold text-green-600 mb-4">₹50,000</div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{width: visibleSections.has('dashboard') ? '68%' : '0%'}}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">68% completed</p>
              </div>
              
              {/* Monthly Spending */}
              <div className={`bg-white border border-gray-200 p-6 rounded-xl hover-lift ${visibleSections.has('dashboard') ? 'animate-fadeInRight animate-delay-500' : 'initial-hidden'}`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Spending</h3>
                <div className="text-2xl font-bold text-orange-600 mb-4">₹32,150</div>
                <div className="flex items-center text-orange-600">
                  <Target size={16} className="mr-2" />
                  <span className="text-sm">Within budget</span>
                </div>
              </div>
            </div>
            
            {/* AI Insights with special animation */}
            <div className={`mt-6 bg-blue-50 border border-blue-200 p-6 rounded-xl hover-lift ${visibleSections.has('dashboard') ? 'animate-fadeInUp animate-delay-600' : 'initial-hidden'}`}>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4 animate-pulse-custom">
                  <Brain className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">AI Insight</h4>
                  <p className="text-blue-800">
                    You're spending 23% more on dining out this month. Consider cooking at home 2 more times per week to save ₹2,400 monthly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with grid animations */}
      <section id="features" className="py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 ${visibleSections.has('features') ? 'animate-fadeInUp' : 'initial-hidden'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Money Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to take control of your finances, powered by artificial intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover-lift group ${
                  visibleSections.has('features') 
                    ? `animate-fadeInUp animate-delay-${(index + 1) * 100}` 
                    : 'initial-hidden'
                }`}
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`text-${feature.color}-600`} size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with card animations */}
      <section id="pricing" className="py-20 bg-gray-50" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 ${visibleSections.has('pricing') ? 'animate-fadeInUp' : 'initial-hidden'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className={`bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover-lift ${visibleSections.has('pricing') ? 'animate-fadeInLeft animate-delay-200' : 'initial-hidden'}`}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">₹0</div>
                <p className="text-gray-600">Forever free</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {['Basic expense tracking', 'Monthly reports', 'Up to 50 transactions', 'Export to Excel'].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login">
              <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all hover:scale-105">
                Get Started Free
              </button>
              </Link>
            </div>
            
            {/* Pro Plan with special styling */}
            <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative hover-lift ${visibleSections.has('pricing') ? 'animate-fadeInRight animate-delay-300' : 'initial-hidden'}`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium animate-pulse-custom">
                Most Popular
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Finance Pro</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-blue-600">₹1</span>
                  <span className="text-gray-600 ml-2">/month</span>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md ml-3 line-through">₹30</span>
                </div>
                <div className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full inline-block mb-2 animate-pulse-custom">
                  Early Bird Offer - Limited Time!
                </div>
                <p className="text-gray-600">7-day free trial</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="text-blue-500 mr-3" size={20} />
                  <span className="font-medium">Everything in Basic, plus:</span>
                </li>
                {pricingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="text-blue-500 mr-3" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/upgrade">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center hover:scale-105">
                Start Free Trial <ArrowRight className="ml-2" size={18} />
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with slide animations */}
      <section id="testimonials" className="py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 ${visibleSections.has('testimonials') ? 'animate-fadeInUp' : 'initial-hidden'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands of Users
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users are saying about their financial transformation.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className={`bg-blue-50 rounded-2xl p-8 md:p-12 hover-lift ${visibleSections.has('testimonials') ? 'animate-scaleIn animate-delay-200' : 'initial-hidden'}`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-custom">
                  <span className="text-white font-bold text-lg">
                    {testimonials[currentTestimonial].avatar}
                  </span>
                </div>
                
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className={`text-yellow-400 fill-current animate-fadeInUp animate-delay-${(i + 1) * 100}`} size={24} />
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl text-blue-900 italic mb-6 animate-fadeInUp">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                
                <div className="animate-fadeInUp animate-delay-100">
                  <div className="font-semibold text-blue-900 text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-blue-700">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentTestimonial ? 'bg-blue-600 scale-110' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with dramatic animations */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600" data-animate id="cta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${visibleSections.has('cta') ? 'animate-fadeInUp' : 'initial-hidden'}`}>
              Ready to Transform Your Financial Life?
            </h2>
            <p className={`text-xl text-blue-100 mb-8 ${visibleSections.has('cta') ? 'animate-fadeInUp animate-delay-100' : 'initial-hidden'}`}>
              Join thousands of users who have already started their journey to financial freedom with AI Finance Pro.
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${visibleSections.has('cta') ? 'animate-fadeInUp animate-delay-200' : 'initial-hidden'}`}>
              <Link to="/login">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center hover:scale-105 hover:shadow-xl">
                Start Your Free Trial <ArrowRight className="ml-2" size={20} />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105">
                Schedule Demo
              </button>
              </Link>
            </div>
            
            <p className={`text-blue-200 text-sm mt-4 ${visibleSections.has('cta') ? 'animate-fadeInUp animate-delay-300' : 'initial-hidden'}`}>
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <FooterContainer/>
    </div>
  );
};

export default PricingPage;