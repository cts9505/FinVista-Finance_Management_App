import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

const TermsAndConditionsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12 mt-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms and Conditions</h1>
            <p className="text-lg text-gray-600">
              Please read these terms and conditions carefully before using our services.
            </p>
          </div>
          
          {/* Terms Content */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="prose max-w-none">
              <p className="mb-4">
                For the purpose of these Terms and Conditions, The term "we", "us", "our" used anywhere on this page shall mean FinVista, developed by CHAITANYA TUKARAM SHINDE, whose registered/operational office is Pradhikaran, Pune, MAHARASHTRA 411044. "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to use our services.
              </p>
              
              <p className="mb-4">
                Your use of the website and/or services are governed by the following Terms and Conditions:
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By registering for an account, accessing, or using FinVista, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy.
              </p>
              <p className="mb-4">
                If you are using FinVista on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms. In such cases, "you" and "your" will refer to both you and that organization.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">2. User Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  <strong>Age Requirement:</strong> You must be at least 5 years old to use FinVista. If you are under 18, you must have permission from a parent or legal guardian.
                </li>
                <li>
                  When creating an account with FinVista, you agree to provide accurate, current, and complete information as prompted by our registration forms.
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </li>
                <li>
                  <strong>Content Responsibility:</strong> You are solely responsible for all content you upload, share, or distribute through our service.
                </li>
                <li>
                  <strong>Prohibited Content:</strong> You must not upload, share, or distribute content that:
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Is illegal, fraudulent, deceptive, or misleading</li>
                    <li>Infringes on intellectual property rights of others</li>
                    <li>Contains malware, viruses, or other harmful code</li>
                    <li>Constitutes hate speech, harassment, or threats</li>
                    <li>Depicts violence, sexually explicit material, or exploitation of minors</li>
                    <li>Violates any applicable laws or regulations</li>
                  </ul>
                </li>
                <li>
                  You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                </li>
                <li>
                  We reserve the right to terminate or suspend your account at our discretion without notice if we believe that you have violated these Terms or for any other reason.
                </li>
                <li>
                  User accounts may be subject to deactivation after periods of inactivity in accordance with our data retention policies.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">3. Service Usage & Limitations</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  <strong>Service Description:</strong> FinVista provides a platform for managing personal and business finances with configurable privacy and security settings.
                </li>
                <li>
                  <strong>Service Modifications:</strong> We reserve the right to modify, suspend, or discontinue any aspect of our Service at any time without prior notice.
                </li>
                <li>
                  <strong>Usage Limits:</strong> Free accounts may be subject to storage limits, feature restrictions, and other limitations. Premium accounts will have access to additional features as described in our subscription plans.
                </li>
                <li>
                  <strong>Account Termination:</strong> We may suspend or terminate your account if:
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>You violate these Terms</li>
                    <li>You engage in fraudulent or illegal activities</li>
                    <li>Your usage poses a security risk to our Service</li>
                    <li>You have been inactive for an extended period</li>
                    <li>We cease operations or terminate the Service</li>
                  </ul>
                </li>
                <li>
                  <strong>Data Removal:</strong> We reserve the right to remove any content that violates these Terms or that we deem inappropriate, harmful, or unlawful.
                </li>
                <li>
                  FinVista may offer trial periods and various subscription plans that provide access to premium features.
                </li>
                <li>
                  Trial periods are subject to the terms specified at the time of sign-up and may be modified or terminated at our discretion.
                </li>
                <li>
                  Subscription plans are billed according to the terms specified during sign-up (monthly or annually).
                </li>
                <li>
                  Subscriptions automatically renew unless cancelled by the user before the renewal date.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">4. Website Usage</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  The content of the pages of this website is subject to change without notice.
                </li>
                <li>
                  Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.
                </li>
                <li>
                  You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
                </li>
                <li>
                  Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable.
                </li>
                <li>
                  It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics.
                </li>
                <li>
                  You retain ownership of all content you upload to FinVista. However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to store, display, and distribute your content solely for the purpose of providing and improving our Service.
                </li>
                <li>
                  Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
                </li>
                <li>
                  All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
                </li>
                <li>
                  Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
                </li>
                <li>
                  If you provide us with feedback, suggestions, or ideas regarding our Service, you grant us the right to use such feedback without restriction or compensation.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">6. Security and Data Protection</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  <strong>Privacy Policy:</strong> Our Privacy Policy, which describes how we collect, use, and disclose your information, is incorporated into these Terms by reference.
                </li>
                <li>
                  <strong>Data Security:</strong> We implement reasonable security measures to protect your data; however, no method of transmission or storage is 100% secure. You acknowledge this limitation.
                </li>
                <li>
                  <strong>Cookies and Similar Technologies:</strong> We may use cookies and similar technologies to enhance your experience and gather usage information as described in our Privacy Policy.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitations and Liability</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  <strong>Service Provided "As Is":</strong> FinVista is provided on an "as is" and "as available" basis, without warranties of any kind, either express or implied.
                </li>
                <li>
                  <strong>No Guarantees:</strong> We do not guarantee that:
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>The Service will meet your specific requirements</li>
                    <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                    <li>Any errors in the Service will be corrected</li>
                  </ul>
                </li>
                <li>
                  We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
                </li>
                <li>
                  From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).
                </li>
                <li>
                  You may not create a link to our website from another website or document without FinVista's prior written consent.
                </li>
                <li>
                  <strong>Force Majeure:</strong> We are not liable for any failure or delay in performance due to circumstances beyond our reasonable control.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">8. Indemnification</h2>
              <p className="mb-4">
                You agree to defend, indemnify, and hold harmless FinVista, its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses arising from your violation of these Terms or your use of the Service.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">9. Governing Law</h2>
              <p className="mb-4">
                Any dispute arising out of use of our website and/or services and/or any engagement with us is subject to the laws of India.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">10. Modifications to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. It is your responsibility to check these terms periodically for changes.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about our Terms and Conditions, please <Link to='/contact-us' className='text-blue-700' >Contact Us</Link>:
              </p>
              <ul className="list-none space-y-1 mb-4">
                <li><strong>Address:</strong> Pradhikaran, Pune, Maharashtra 411044</li>
                <li><strong>Phone:</strong> +91 9373954169</li>
                <li><strong>Email:</strong> finvistafinancemanagementapp@gmail.com</li>
              </ul>
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

export default TermsAndConditionsPage;