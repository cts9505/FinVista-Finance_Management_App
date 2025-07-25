import React from 'react';
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

const RefundsCancellationPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12 mt-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Refunds & Cancellation Policy</h1>
            <p className="text-lg text-gray-600">
              Understanding our policies regarding subscriptions, cancellations, and refunds.
            </p>
          </div>
          
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="prose max-w-none">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Refund Policy</h2>
                <p className="mb-4">
                  FinVista has established the following refund policy for its services:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>
                    Currently, there are no refunds available for any of our subscription plans or services.
                  </li>
                  <li>
                    All purchases and subscriptions are final once processed.
                  </li>
                  <li>
                    We encourage users to take advantage of our free trial option before committing to a paid subscription.
                  </li>
                </ul>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 mb-4">
                  <p className="text-gray-700">
                    <strong>Important:</strong> Before subscribing to a premium plan, please ensure that our service meets your requirements by exploring the free trial or free tier features.
                  </p>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Plans</h2>
                <p className="mb-4">
                  FinVista offers the following subscription options:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>
                    <strong>Free Tier:</strong> Basic features available at no cost.
                  </li>
                  <li>
                    <strong>Trial:</strong> A limited-time access to premium features to evaluate our services.
                  </li>
                  <li>
                    <strong>Monthly Subscription:</strong> Premium features billed on a monthly basis.
                  </li>
                  <li>
                    <strong>Annual Subscription:</strong> Premium features billed annually at a discounted rate.
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Cancellation</h2>
                <p className="mb-4">
                  You may cancel your subscription at any time:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>
                    Cancelling your subscription will stop automatic renewals for future billing cycles.
                  </li>
                  <li>
                    You will continue to have access to your subscription until the end of your current billing period.
                  </li>
                  <li>
                    To cancel your subscription, log in to your account and navigate to the subscription management section, or contact our customer support team.
                  </li>
                  <li>
                    No refunds will be provided for the remaining unused portion of your current subscription period.
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Special Circumstances</h2>
                <p className="mb-4">
                  While our general policy is no refunds, we understand that special circumstances may arise:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>
                    In exceptional cases, refund requests may be considered at the discretion of management.
                  </li>
                  <li>
                    If you experience significant technical issues that severely impact your ability to use our service, please contact our support team immediately.
                  </li>
                  <li>
                    In cases of unauthorized charges or fraudulent activity, please contact us immediately with all relevant details.
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Deactivation</h2>
                <p className="mb-4">
                  If you wish to deactivate your account:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>
                    You can request account deactivation through your account settings or by contacting customer support.
                  </li>
                  <li>
                    Deactivating your account does not automatically cancel any active subscriptions. You must cancel your subscription separately.
                  </li>
                  <li>
                    After deactivation, your account will be scheduled for deletion according to our data retention policies.
                  </li>
                  <li>
                    Logging back into your account during the retention period will reactivate your account.
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Contact Us</h2>
                <p className="mb-4">
                  If you have questions about this policy or need to discuss a specific situation regarding your subscription:
                </p>
                <ul className="list-none space-y-2 mb-4">
                  <li><strong>Email:</strong> finvistafinancemanagementapp@gmail.com</li>
                  <li><strong>Phone:</strong> +91 9373954169</li>
                  <li><strong>Address:</strong> Pradhikaran, Pune, Maharashtra 411044</li>
                </ul>
                <p>
                  <Link to='/contact-us' className='text-blue-700' >Contact Us</Link> : Our support team will respond to your inquiry within 1-2 business days.
                </p>
              </div>
              
              <div className="p-4 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Important Note</h3>
                <p className="text-gray-700">
                  This policy is subject to change without prior notice. We recommend checking this page periodically for any updates or changes to our refund and cancellation policies.
                </p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I cancel my subscription?</h3>
                <p className="text-gray-600">You can cancel your subscription by logging into your account, navigating to the "Settings" section, and selecting "Subscription Management." From there, you'll see an option to cancel your subscription. Your access will continue until the end of your current billing period.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What happens to my data if I cancel?</h3>
                <p className="text-gray-600">When you cancel your subscription, your account will revert to the free tier, and you'll retain access to basic features. Your data will remain in our system unless you specifically request account deletion or deactivation.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I get a partial refund if I cancel mid-billing cycle?</h3>
                <p className="text-gray-600">No, we do not offer prorated refunds for unused portions of your subscription. When you cancel, you'll continue to have access to premium features until the end of your current billing period.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How long is the free trial period?</h3>
                <p className="text-gray-600">Our free trial typically lasts for 14 days, giving you full access to premium features. You can check the exact duration when signing up. No payment information is required to start a trial.</p>
              </div>
            </div>
          </div>
          
          {/* Last Updated */}
          <div className="text-right mt-6 text-sm text-gray-500">
            <p>Last Updated: April 18, 2025</p>
          </div>
        </div>
      </div>
      
      <FooterContainer />
    </div>
  );
};

export default RefundsCancellationPage;