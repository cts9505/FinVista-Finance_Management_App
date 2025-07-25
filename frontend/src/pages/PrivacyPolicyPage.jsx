import React from 'react';
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar';
import FooterContainer from '../components/Footer';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12 mt-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Learn how we collect, use, and protect your personal information.
            </p>
          </div>
          
          {/* Privacy Policy Content */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="prose max-w-none">
              <p className="mb-4">
                This privacy policy sets out how FinVista, developed by CHAITANYA TUKARAM SHINDE, uses and protects any information that you give when you use our website and services. We are committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this privacy statement.
              </p>
              
              <p className="mb-4">
                We may change this policy from time to time by updating this page. You should check this page periodically to ensure that you are aware of these changes.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
              <p className="mb-2">We may collect the following information:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Name</li>
                <li>Contact information including email address and phone number</li>
                <li>Demographic information such as address, age, and employment status</li>
                <li>Financial information such as income, savings goals, and investment preferences</li>
                <li>Device information including IP address, browser type, operating system, and location data</li>
                <li>Usage data including login history and account activity</li>
                <li>Custom categories created for budgeting and expense tracking</li>
                <li>Monthly budgets and financial goals</li>
                <li>Other information relevant to customer surveys, offers, or service improvements</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">2. End-to-End Encryption</h2>
              <p className="mb-4">
                FinVista implements end-to-end encryption for all sensitive financial data you upload to our platform. This means:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Your financial content is encrypted on your device before being transmitted to our servers</li>
                <li>The content remains encrypted while stored on our servers</li>
                <li>Only you and those you explicitly authorize have the decryption keys</li>
                <li>Even we, as the service provider, cannot access, view, or read your encrypted financial data</li>
                <li>In the event of a data breach, your content remains encrypted and protected</li>
                <li>Government requests for your data would yield only encrypted information that we cannot decrypt</li>
              </ul>
              <p className="mb-4">
                This zero-knowledge architecture ensures maximum privacy and security for your sensitive financial information.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">
                We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>To provide, maintain, and improve our services.</li>
                <li>To manage your account, including verifying your identity for security purposes.</li>
                <li>To personalize your experience and provide customized financial recommendations.</li>
                <li>To process and complete transactions, and send related information including transaction confirmations and invoices.</li>
                <li>To communicate with you, including responding to your inquiries and requests.</li>
                <li>To send you updates, security alerts, and support messages.</li>
                <li>We may use the information to improve our products and services.</li>
                <li>We may periodically send promotional emails about new features, special offers, or other information which we think you may find interesting.</li>
                <li>We may use the information to customize the website according to your interests and needs.</li>
                <li>To monitor and analyze trends, usage, and activities in connection with our services.</li>
                <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
              </p>
              
              <p className="mb-4">
                For inactive accounts, we may deactivate your account after extended periods of inactivity. If you choose to deactivate your account, your account data will be scheduled for deletion in accordance with our data retention policies.
              </p>
              
              <p className="mb-4">
                Financial data you create on FinVista will be retained according to the settings you select. Once content is deleted, it may remain in our backup systems for a limited period before being permanently deleted.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">5. Information Sharing and Disclosure</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
                <li><strong>Compliance with Laws:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
                <li><strong>With Your Consent:</strong> We may share your information with third parties when you explicitly consent to such sharing.</li>
                <li><strong>Encrypted Content:</strong> Due to our end-to-end encryption, we cannot and do not share your actual financial data with any third parties, as we do not have access to the unencrypted content.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">6. Security and Data Protection</h2>
              <p className="mb-4">
                We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have implemented suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect.
              </p>
              
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect the security of your personal information, including end-to-end encryption of all uploaded sensitive content. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">7. Login History and Security</h2>
              <p className="mb-4">
                We maintain a limited history of your login sessions to help protect your account security. This includes information about the device, browser, operating system, IP address, and location used to access your account. This information helps us identify suspicious login attempts and protect your account from unauthorized access.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">8. How We Use Cookies</h2>
              <p className="mb-4">
                A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
              </p>
              
              <p className="mb-4">
                We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
              </p>
              
              <p className="mb-4">
                Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
              </p>
              
              <p className="mb-4">
                You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">9. Your Rights and Choices</h2>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Account Information:</strong> You can update, correct, or delete your account information at any time by logging into your account settings.</li>
                <li><strong>Content Deletion:</strong> You can delete content you've created according to our retention policies.</li>
                <li><strong>Cookies:</strong> Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject browser cookies.</li>
                <li><strong>Communications:</strong> You may opt out of receiving promotional communications from us by following the instructions in those communications.</li>
                <li><strong>Data Subject Rights:</strong> Depending on your location, you may have rights to access, correct, delete, restrict processing of, and port your personal data, as well as the right to object to certain processing activities.</li>
                <li>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at finvistafinancemanagementapp@gmail.com.</li>
                <li>You may request a copy of personal information that we hold about you.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                FinVista is intended for use by individuals who are at least 5 years of age. If you are a parent or guardian and believe we have collected information from a child under the age of 18 without appropriate consent, please contact us immediately.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">11. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to, and maintained on, computers located outside your state, province, country, or other governmental jurisdiction where privacy laws may be different from those in your jurisdiction. If you are located outside India and choose to provide information to us, we may transfer your data to India and process it there. Note that your encrypted content remains protected during any such transfers.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">12. Controlling Your Personal Information</h2>
              <p className="mb-4">
                We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
              </p>
              
              <p className="mb-4">
                If you believe that any information we are holding on you is incorrect or incomplete, please contact us at the address below as soon as possible. We will promptly correct any information found to be incorrect.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please <Link to='/contact-us' lassName='text-blue-700' >Contact Us</Link>:
              </p>
              <ul className="list-none space-y-1 mb-4">
                <li><strong>Address:</strong> Pradhikaran, Pune , Maharashtra 411044</li>
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

export default PrivacyPolicyPage;