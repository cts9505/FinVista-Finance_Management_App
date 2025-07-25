# 🎯 MERN Authentication App

This is a **full-stack authentication application** built using the **MERN stack** (MongoDB, Express.js, React, and Node.js). It supports authentication via **JWT** as well as **OAuth using Google**.

## ✨ Features
🇫🇷 **User Registration and Login**  
🔑 **JWT Authentication**  
👋 **OAuth Authentication with Google**  
🔒 **Secure Password Hashing**  
📧 **Email Verification (SMTP Support)**  
🔧 **Environment-based Configuration**  

## 🛠 Technologies Used
### 🎨 Frontend:
- 🎯 **React (Vite)**
- 🚀 **React Router**
- 🔗 **Axios**
- 🎨 **Tailwind CSS** (if used)

### 🖥 Backend:
- 🛠 **Node.js**
- ⚡ **Express.js**
- 💾 **MongoDB (Mongoose ORM)**
- 🔐 **JSON Web Token (JWT)**
- 🔑 **Passport.js** (for OAuth)
- 📧 **Nodemailer** (for email verification)

---

## 🚀 Installation and Setup

### 📌 Prerequisites
🔹 **Node.js** (>=14)  
🔹 **MongoDB** (local or cloud)  

### Clone the Repository
```bash
git clone https://github.com/cts9505/MERN-Authentication.git
cd MERN-Authentication
```

### 🔧 Backend Setup
```bash
cd backend
npm install
```

#### 📝 Configure Environment Variables
Create a **`.env`** file in the `backend` directory and add the following variables:
```bash
PORT=<your-port>
MONGO_URL=<your-url>
JWT_KEY=<your-secret-key>
NODE_ENV=<your-mode>
SMTP_HOST=<your-smtp-host>
SMTP_PORT=<your-port>
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
SENDER_EMAIL=<your-email>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
JWT_SECRET=<your-jwt-secret>
JWT_TIMEOUT=<your-jwt-timeout>
GEMINI_API_KEY=<your-gemini-api-key>
```

#### ▶ Start the Backend Server
```bash
npm start
```

---

### 🎨 Frontend Setup
```bash
cd frontend
npm install
```

#### 📝 Configure Environment Variables
Create a **`.env`** file in the `frontend` directory and add the following variables:
```bash
VITE_BACKEND_URL=<your-backend-url>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

#### ▶ Start the Frontend Server
```bash
npm run dev
```

---

## 🔒 API Endpoints

| 🏇 Method | 🌍 Route                | 📝 Description           |
|-----------|----------------------|------------------------|
| **POST**  | `/api/auth/register` | 📰 Register a new user    |
| **POST**  | `/api/auth/login`    | 🔑 Login user & get token |
| **GET**   | `/api/user/get-data` | 🤖 Get authenticated user |
| **POST**  | `/api/auth/logout`   | 🛋 Logout user            |

---

## 🤝 Contributing
Feel free to **fork** the repository and submit **pull requests**.

## 🐟 License
This project is licensed under the **MIT License**.

---
