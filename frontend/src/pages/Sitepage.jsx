import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

export default function Sitemap() {
  const [showXml, setShowXml] = useState(false);
  
  const sitemapData = {
    public: [
      { name: "Home", path: "/" },
      { name: "Features", path: "/features" },
      { name: "Login", path: "/login" },
      { name: "Email Verification", path: "/verify-email" },
      { name: "Reset Password", path: "/reset-password" },
      { name: "Terms & Conditions", path: "/terms-and-condition" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Refunds & Cancellation", path: "/refund-and-cancellation" },
      { name: "Contact Us", path: "/contact-us" },
      { name: "Bug Report", path: "/bug-report" },
      { name: "Rating & Review", path: "/rating-and-review" }
    ],
    protected: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Budgets", path: "/budgets" },
      { name: "Incomes", path: "/incomes" },
      { name: "Expenses", path: "/expenses" },
      { name: "Bills", path: "/bills" },
      { name: "Transaction Upload", path: "/transaction-upload" },
      { name: "Chat", path: "/chat" },
      { name: "Profile", path: "/profile" },
      { name: "Change Password", path: "/change-password" },
      { name: "Upgrade", path: "/upgrade" },
      { name: "Onboarding", path: "/onboarding" }
    ],
    admin: [
      { name: "Bug Reports Admin", path: "/all-bugs" },
      { name: "Contact Form Admin", path: "/all-contact-us" },
      { name: "Reviews Admin", path: "/all-reviews" }
    ]
  };

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Public Pages -->
  <url>
    <loc>https://finvista.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://finvista.com/features</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://finvista.com/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://finvista.com/verify-email</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://finvista.com/reset-password</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://finvista.com/terms-and-condition</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://finvista.com/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://finvista.com/refund-and-cancellation</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://finvista.com/contact-us</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://finvista.com/bug-report</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://finvista.com/rating-and-review</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Protected Pages (Listed for sitemap completeness, but may require authentication) -->
  <url>
    <loc>https://finvista.com/dashboard</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://finvista.com/budgets</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://finvista.com/incomes</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://finvista.com/expenses</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://finvista.com/bills</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md mt-20">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Finvista Sitemap</h1>
          <p className="mt-2 text-indigo-100">Complete website structure and navigation guide</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Top Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowXml(!showXml)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {showXml ? "Hide XML Sitemap" : "View XML Sitemap"}
          </button>
        </div>

        {/* XML View */}
        {showXml && (
          <div className="mb-8 bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">{xmlContent}</pre>
          </div>
        )}

        {/* Visual Sitemap */}
        {!showXml && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Public Pages */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-indigo-600 border-b pb-2">Public Pages</h2>
                <ul className="space-y-3">
                  {sitemapData.public.map((page, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <Link to={page.path} className="text-gray-700 hover:text-indigo-600 transition">
                        {page.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Protected Pages */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-indigo-600 border-b pb-2">Protected Pages</h2>
                <ul className="space-y-3">
                  {sitemapData.protected.map((page, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <Link to={page.path} className="text-gray-700 hover:text-indigo-600 transition">
                        {page.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Admin Pages */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-indigo-600 border-b pb-2">Admin Pages</h2>
                <ul className="space-y-3">
                  {sitemapData.admin.map((page, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a1 1 0 10-2 0 8 8 0 0016 0 1 1 0 00-2 0 5.986 5.986 0 00-.454 2.916A5 5 0 008 11z" clipRule="evenodd" />
                      </svg>
                      <Link to={page.path} className="text-gray-700 hover:text-indigo-600 transition">
                        {page.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Site Structure Visualization */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6 text-indigo-600">Site Structure Visualization</h2>
              <div className="overflow-auto">
                <div className="sitemap-tree min-w-max">
                  <ul className="flex flex-col items-center">
                    <li>
                      <div className="site-node text-center border-2 border-indigo-600 rounded-lg p-2 bg-indigo-50 font-bold text-indigo-800">
                        Home Page
                      </div>
                      <ul className="flex flex-wrap justify-center pt-8 mt-4 relative">
                        <div className="absolute top-0 left-1/2 h-8 w-px bg-gray-400 -translate-x-1/2"></div>
                        
                        {/* Public Section */}
                        <li className="mx-4 mb-6">
                          <div className="site-node border border-blue-500 rounded p-2 bg-blue-50 text-blue-700">
                            Public Pages
                          </div>
                          <ul className="flex flex-col items-start mt-4 pl-6 relative">
                            <div className="absolute top-0 left-0 h-full w-px bg-gray-300"></div>
                            {sitemapData.public.slice(1, 4).map((page, index) => (
                              <li key={index} className="mb-2 relative">
                                <div className="absolute top-1/2 -left-6 h-px w-6 bg-gray-300"></div>
                                <div className="site-node text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                                  {page.name}
                                </div>
                              </li>
                            ))}
                            <li className="mb-2 relative">
                              <div className="absolute top-1/2 -left-6 h-px w-6 bg-gray-300"></div>
                              <div className="site-node text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                                Support & Legal Pages
                              </div>
                            </li>
                          </ul>
                        </li>

                        {/* User Flow */}
                        <li className="mx-4 mb-6">
                          <div className="site-node border border-green-500 rounded p-2 bg-green-50 text-green-700">
                            User Dashboard
                          </div>
                          <ul className="flex flex-col items-start mt-4 pl-6 relative">
                            <div className="absolute top-0 left-0 h-full w-px bg-gray-300"></div>
                            <li className="mb-2 relative">
                              <div className="absolute top-1/2 -left-6 h-px w-6 bg-gray-300"></div>
                              <div className="site-node text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                                Financial Tools
                              </div>
                              <ul className="flex flex-col items-start mt-2 pl-6 relative">
                                <div className="absolute top-0 left-0 h-full w-px bg-gray-300"></div>
                                {['Budgets', 'Incomes', 'Expenses', 'Bills'].map((name, idx) => (
                                  <li key={idx} className="mb-1 relative">
                                    <div className="absolute top-1/2 -left-6 h-px w-6 bg-gray-300"></div>
                                    <div className="site-node text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50">
                                      {name}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </li>
                            <li className="mb-2 relative">
                              <div className="absolute top-1/2 -left-6 h-px w-6 bg-gray-300"></div>
                              <div className="site-node text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                                User Account
                              </div>
                            </li>
                          </ul>
                        </li>

                        {/* Admin Section */}
                        <li className="mx-4 mb-6">
                          <div className="site-node border border-purple-500 rounded p-2 bg-purple-50 text-purple-700">
                            Admin Portal
                          </div>
                          <ul className="flex flex-col items-start mt-4 pl-6 relative">
                            <div className="absolute top-0 left-0 h-full w-px bg-gray-300"></div>
                            {sitemapData.admin.map((page, index) => (
                              <li key={index} className="mb-2 relative">
                                <div className="absolute top-1/2 -left-6 h-px w-6 bg-gray-300"></div>
                                <div className="site-node text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                                  {page.name}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sitemap Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-indigo-600">Sitemap Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Update Frequency</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="inline-block w-16 text-sm font-medium text-gray-600">Daily:</span>
                  <span className="text-gray-700">Dashboard, Budgets, Incomes, Expenses</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-16 text-sm font-medium text-gray-600">Weekly:</span>
                  <span className="text-gray-700">Home, Reviews</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-16 text-sm font-medium text-gray-600">Monthly:</span>
                  <span className="text-gray-700">Features, Login, Profile</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-16 text-sm font-medium text-gray-600">Yearly:</span>
                  <span className="text-gray-700">Legal pages</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">SEO Priority</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="inline-block w-24 text-sm font-medium text-gray-600">Highest (1.0):</span>
                  <span className="text-gray-700">Home Page</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-24 text-sm font-medium text-gray-600">High (0.9):</span>
                  <span className="text-gray-700">Login, Dashboard</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-24 text-sm font-medium text-gray-600">Medium (0.8):</span>
                  <span className="text-gray-700">Features, Financial Tools</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-24 text-sm font-medium text-gray-600">Lower (0.4-0.7):</span>
                  <span className="text-gray-700">Support and Legal Pages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterContainer />
    </div>
  );
}