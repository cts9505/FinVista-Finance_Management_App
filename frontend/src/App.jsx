import './index.css'
import { Routes,Route,Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import Dashboard from './pages/Dashboard'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import  FooterContainer  from './components/Footer'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from 'react';
import RefreshHandler from './context/RefreshHandler';
import NotFound from './pages/NotFound';
import GlobalContextProvider from "./context/GlobalContext";
import BudgetsDashboard from './pages/Budget'
import Navbar from './components/Navbar'
import IncomePage from './pages/Income'
import ExpensePage from './pages/Expense'
import {Toaster} from 'react-hot-toast'
import BillPage from './pages/BillPage'
import UpgradePage from './pages/Upgrade'
import OnboardingPage from './pages/OnboardingPage'
import ProfilePage from './pages/Profile'
import ChatPage from './pages/Chat'
import ReceiptScanner from './pages/TransactionUpload'
import PasswordChangePage from './pages/ChangePassword'
import ReportBugPage from './pages/BugReport'
import BugReportsAdmin from './pages/BugReportAdmin'
import ContactUsPage from './pages/ContactUsPage'
import AdminContactDashboard from './pages/ContactUsAdmin'
import TermsAndConditionsPage from './pages/TermsAndConditionPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import RefundsCancellationPage from './pages/RefundsCancellationPage'
import { ProtectedRoute,AdminRoute } from './pages/ProtectedRoutes'
import ScrollToTop from './components/ScrollToTop'
import ReviewPage from './pages/ReviewPage'
import AdminReviewPage from './pages/ReviewPageAdmin'
import Features from './pages/FeaturesPage'
import Sitemap from './pages/Sitepage'
import VerifyEmail from './pages/EmailVerify'
import PricingPage from './pages/PricingPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
	const GoogleWrapper = ()=>(
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<Login></Login>
		</GoogleOAuthProvider>
	)
  
  return (
    <>
  <ToastContainer />
  {/* <Navbar/> */}
  {/* <RefreshHandler setIsAuthenticated={setIsAuthenticated} /> */}
  <GlobalContextProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<EmailVerify />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budgets" element={<BudgetsDashboard/>}/>
          <Route path="/incomes" element={<IncomePage/>}/>
          <Route path="/expenses" element={<ExpensePage/>}/>
          <Route path="/bills" element={<BillPage/>}/>
          <Route path="/upgrade" element={<UpgradePage/>}/>
          <Route path="/onboarding" element={<OnboardingPage/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path='/chat' element={<ChatPage/>}/>
          <Route path='/transaction-upload' element={<ReceiptScanner/>}/>
          <Route path="/change-password" element={<PasswordChangePage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/all-bugs" element={<BugReportsAdmin />} />
          <Route path="/all-contact-us" element={<AdminContactDashboard />} />
          <Route path="/all-reviews" element={<AdminReviewPage />} />
        </Route>
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/bug-report" element={<ReportBugPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/terms-and-condition" element={<TermsAndConditionsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/refund-and-cancellation" element={<RefundsCancellationPage />} />
        <Route path="/rating-and-reviews" element={<ReviewPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster  toastOptions={{className:'',style:{fontSize:'15px'}}} />
    </GoogleOAuthProvider>
  </GlobalContextProvider>
  {/* <FooterContainer /> */}
</>

  )
}

export default App
