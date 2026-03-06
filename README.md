# 💰 FinVista - Finance Management Application

A **comprehensive financial management platform** built with the **MERN stack** (MongoDB, Express.js, React, and Node.js). FinVista empowers users to track expenses, manage income, plan budgets, monitor bills, and gain intelligent financial insights with an AI-powered chat assistant.

![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18.3+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v8+-green)

---

## ✨ Key Features

### 💳 **Financial Tracking**
- 📊 **Expense Management** - Categorize and track spending patterns
- 💵 **Income Tracking** - Record multiple income sources
- 📋 **Bill Management** - Track and manage recurring bills
- 💰 **Budget Planning** - Set and monitor monthly budgets
- 📈 **Dashboard Analytics** - Visual charts and financial insights with real-time data

### 🔐 **Authentication & Security**
- 🔑 **JWT Authentication** - Secure token-based authentication
- 👤 **Google OAuth Integration** - One-click authentication with Google
- 📧 **Email Verification** - OTP-based email verification
- 🔒 **Secure Password Management** - Password hashing with bcryptjs
- 🛡️ **Role-based Access Control** - Admin and user roles with premium tier system

### 🤖 **AI-Powered Features**
- 🧠 **Smart Finance Chat** - Powered by Google Generative AI (Gemini)
- 📸 **Receipt OCR** - Automatic expense extraction from receipt images
- 📄 **Transaction Upload** - Bulk transaction processing with Excel support

### 💳 **Premium Features** (Subscription System)
- 💣 Premium access with Razorpay payment integration
- 🎁 Free trial for users to explore premium features
- 📊 Advanced analytics and reporting
- 🔄 Subscription management and cancellation

### 🎯 **Additional Features**
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 📧 **Email Notifications** - Scheduled emails with financial summaries
- 💬 **Contact Support** - Built-in contact us and support system
- ⭐ **User Reviews** - Review system with admin approval workflow
- 📰 **Newsletter Subscription** - Email newsletter functionality
- 🐛 **Bug Reporting** - User feedback and bug report tracking
- 🔔 **Real-time Updates** - Live data synchronization
- 🎨 **Dark Mode Support** - Tailwind CSS responsive design

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library with Vite for fast bundling |
| **React Router v7** | Client-side routing and navigation |
| **Tailwind CSS** | Utility-first CSS framework |
| **Axios** | HTTP client for API requests |
| **Recharts/Chart.js** | Interactive data visualization |
| **Framer Motion** | Smooth animations and transitions |
| **Formik** | Form state management and validation |
| **React Datepicker** | Date selection component |
| **Lucide React** | Modern icon library |
| **React Toastify** | Toast notifications |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB object modeling |
| **JWT** | Secure token-based authentication |
| **Passport.js** | OAuth strategy for Google |
| **Razorpay** | Payment processing integration |
| **Nodemailer** | Email sending service |
| **Cloudinary** | Cloud image storage and management |
| **Google Generative AI** | AI-powered chat and insights |
| **Redis** | Caching and session management (via Upstash) |
| **ExcelJS** | Excel file processing |
| **Node Cron** | Scheduled task execution |

---

## 📁 Project Structure

```
FinVista-Finance_Management_App/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── redis.js              # Redis/Upstash configuration
│   │   ├── mailer.js             # Email configuration
│   │   └── emailTemplates.js     # Email templates
│   ├── controllers/              # Route handlers
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   ├── expense.js            # Expense operations
│   │   ├── income.js             # Income operations
│   │   ├── budget.js             # Budget management
│   │   ├── billsController.js    # Bills management
│   │   ├── paymentController.js  # Razorpay integration
│   │   ├── transaction.js        # Transaction processing
│   │   ├── aiChatController.js   # AI chat functionality
│   │   ├── reviewController.js   # Review management
│   │   └── more...
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API routes
│   ├── middleware/               # Custom middleware (auth, multer)
│   ├── utils/                    # Utility functions
│   ├── sender/                   # Cron jobs
│   └── server.js                 # Express app initialization
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── pages/                # Page components (Dashboard, etc.)
│   │   ├── context/              # React context (Global state)
│   │   ├── lib/                  # Utilities (axios instance)
│   │   ├── assets/               # Images and animations
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # React entry point
│   └── package.json
└── README.md                      # This file
```

---

## 🚀 Installation & Setup

### 📋 Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (Atlas cloud or local instance)
- **Cloudinary** account (for image uploads)
- **Razorpay** account (for payments)
- **Google OAuth credentials** (for authentication)
- **Gmail/SMTP credentials** (for email notifications)
- **Google Generative AI API** key (for AI chat)
- **Upstash Redis** account (optional, for caching)

### 📦 Clone Repository

```bash
git clone https://github.com/cts9505/FinVista-Finance_Management_App.git
cd FinVista-Finance_Management_App
```

---

### 🔧 Backend Setup

```bash
cd backend
npm install
```

#### 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/finvista

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_TIMEOUT=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=your_email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI Chat (Google Generative AI)
GEMINI_API_KEY=your_gemini_api_key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# CORS Configuration
FRONTEND_URLS=http://localhost:5173,https://yourdomain.com
```

#### ▶️ Start Backend Server

```bash
npm start
# Server runs on http://localhost:5000
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
```

#### 🔐 Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Backend API
VITE_BACKEND_URL=http://localhost:5000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### ▶️ Start Frontend Server

```bash
npm run dev
# Website runs on http://localhost:5173
```

#### 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 🔌 API Endpoints

### **Authentication** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/send-verify-otp` | Send email verification OTP |
| POST | `/verify-otp` | Verify email with OTP |
| POST | `/reset-password` | Reset forgot password |
| POST | `/google-auth` | Google OAuth authentication |

### **Expenses** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add-expense` | Create expense entry |
| GET | `/get-expense` | Fetch all expenses |
| PUT | `/update-expense` | Update expense |
| DELETE | `/delete-expense/:id` | Delete expense |

### **Income** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add-income` | Create income entry |
| GET | `/get-incomes` | Fetch all income |
| PUT | `/update-income` | Update income |
| DELETE | `/delete-income/:id` | Delete income |

### **Budget** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add-budget` | Create budget |
| GET | `/get-budgets` | Fetch all budgets |
| PUT | `/update-budget` | Update budget |
| DELETE | `/delete-budget/:id` | Delete budget |

### **Bills** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add-bill` | Create bill entry |
| GET | `/get-bills` | Fetch all bills |
| PUT | `/update-bill` | Update bill |
| DELETE | `/delete-bill/:id` | Delete bill |

### **Payments** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-order` | Create Razorpay payment order |
| POST | `/verify-payment` | Verify payment after completion |
| POST | `/start-free-trial` | Start 7-day free trial |
| POST | `/cancel-subscription` | Cancel premium subscription |

### **Transactions** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-transactions` | Upload transactions via image |
| GET | `/get-transactions` | Fetch all transactions |
| PUT | `/update-transaction` | Update transaction |
| DELETE | `/delete-transaction` | Delete transaction |

### **AI Chat** (`/api/ai-chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send-message` | Send message to AI assistant |
| GET | `/get-messages` | Fetch chat history |

### **Reviews** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-review` | Submit user review |
| GET | `/get-reviews` | Fetch public reviews |
| PUT | `/update-review` | Update review |
| DELETE | `/delete-review` | Delete review |

---

## 🎯 Key Workflows

### User Registration & Onboarding
1. User registers with email/Google OAuth
2. Email verification via OTP
3. Financial profile setup (income, expenses, budget categories)
4. Dashboard initialization

### Premium Subscription
1. User clicks upgrade
2. Razorpay payment gateway integration
3. Subscription verification via webhook
4. Premium features unlocked

### Expense Tracking
1. User adds expense manually or via receipt OCR
2. AI categorizes expense automatically
3. Data synced to dashboard
4. Cron job sends weekly/monthly summary emails

---

## 🔒 Security Features

✅ **Password Security** - Bcryptjs hashing (salt rounds: 10)  
✅ **JWT Tokens** - Secure authentication with 7-day expiry  
✅ **CORS Protection** - Whitelist configured frontend URLs  
✅ **Input Validation** - Express-validator for all inputs  
✅ **Email Verification** - OTP-based email confirmation  
✅ **Admin Panel** - Role-based access control  
✅ **Helmet.js** - HTTP headers security middleware  
✅ **Rate Limiting** - Prevent spam and brute force attacks  

---

## 📊 Database Schema (MongoDB Models)

- **User Model** - User accounts, authentication, and profile data
- **Expense Model** - Expense entries with categories and dates
- **Income Model** - Income sources and amounts
- **Budget Model** - Monthly budget allocations
- **Bill Model** - Recurring and non-recurring bills
- **Transaction Model** - Processed transaction data
- **Payment Model** - Subscription and payment history
- **Chat Model** - AI chat conversation history
- **Review Model** - User reviews and ratings
- **Contact Model** - Customer support messages
- **Newsletter Model** - Email subscriber list

---

## 🚢 Deployment

### **Backend (Render)**
1. Connect GitHub repository
2. Configure environment variables
3. Deploy and check health route

### **Frontend (Vercel/Netlify)**
1. Connect GitHub repository
2. Configure build settings
3. Deploy with auto-preview and production URLs

### **Database (MongoDB Atlas)**
- Create cluster in MongoDB Atlas
- Configure IP whitelist
- Connection string in `.env`

---

## 📝 Environment Setup Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Google OAuth credentials configured
- [ ] Razorpay account setup with API keys
- [ ] Cloudinary account created for image storage
- [ ] Gmail/SMTP credentials acquired
- [ ] Google Generative AI API key obtained
- [ ] Upstash Redis account created (optional)
- [ ] `.env` files created in both `backend` and `frontend`
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server started successfully
- [ ] Frontend server started successfully

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright © 2025 Chaitanya Shinde**

---

## 👨‍💻 Author

**Chaitanya Shinde**
- GitHub: [@cts9505](https://github.com/cts9505)

---

## 🆘 Support & Feedback

For issues, feature requests, or feedback:
- 📧 Use the in-app Contact Us feature
- 🐛 Report bugs through the Bug Report section
- ⭐ Leave a review on the Reviews page
- 📞 GitHub Issues: [Create an issue](https://github.com/cts9505/FinVista-Finance_Management_App/issues)

---

## 🔗 Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Razorpay Integration Docs](https://razorpay.com/docs/)
- [Google Generative AI](https://ai.google.dev/)

---

**Happy Tracking with FinVista! 💰📈**
| **POST**  | `/api/auth/logout`   | 🛋 Logout user            |

---

## 🤝 Contributing
Feel free to **fork** the repository and submit **pull requests**.

## 🐟 License
This project is licensed under the **MIT License**.

---
