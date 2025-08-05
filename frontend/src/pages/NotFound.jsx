import React, { useEffect, useRef, useState } from 'react';
import FooterContainer from '../components/Footer';
import Navbar from '../components/Navbar';

const NotFoundPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Professional Header */}
      <Navbar/>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
          }}
        />
        <div 
          className="absolute bottom-20 right-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Professional 404 Display */}
          <div className="mb-20 mt-20 flex justify-center">
            <div className="relative inline-block">
              <div className="text-6xl md:text-9xl font-bold text-gray-800 select-none tracking-wider text-center">
                404
              </div>
            </div>
          </div>

          {/* Professional Error Message */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/50 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              We apologize, but the page you&apos;re looking for cannot be found. This might be due to a mistyped URL, moved content, or temporary server issues.
            </p>

            {/* Professional Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <button
                onClick={handleGoHome}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                  Return to Dashboard
                </div>
              </button>
              
              <button
                onClick={handleGoBack}
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                  </svg>
                  Go Back
                </div>
              </button>
            </div>

            {/* Professional Quick Access */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => handleNavigation('/dashboard')}
                  className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Dashboard</h4>
                  <p className="text-sm text-gray-600">Overview & insights</p>
                </button>
                
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Profile</h4>
                  <p className="text-sm text-gray-600"> Profile Info</p>
                </button>
                
                <button 
                  onClick={() => handleNavigation('/dashboard')}
                  className="group p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Analytics</h4>
                  <p className="text-sm text-gray-600">Reports & trends</p>
                </button>
                
                <button 
                  onClick={() => handleNavigation('/contact-us')}
                  className="group p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-1.106-1.106A6.003 6.003 0 004 10c0 .639.099 1.255.283 1.836l1.362-1.362zM10 8a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Support</h4>
                  <p className="text-sm text-gray-600">Get assistance</p>
                </button>
              </div>
            </div>
          </div>

          {/* Professional Footer Links */}
          <div className="text-center">
            <p className="text-gray-500 mb-4">Need additional assistance?</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="/contact-us" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Contact Support</a>
              <a href="/contact-us" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Help Center</a>
              <a href="/bug-report" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Report Issue</a>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <FooterContainer/>
    </div>
  );
};

export default NotFoundPage;