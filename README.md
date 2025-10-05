# 🍃 Fog & Leaf - Premium Tea E-commerce Platform

A premium tea e-commerce platform with a modern customer website, admin dashboard, and robust backend API.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Installation & Setup](#-installation--setup)
- [📁 Project Structure](#-project-structure)
- [🐛 Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🛍️ Customer Website (`fog-and-leaf`)

- Responsive design built with **Tailwind CSS**
- Product catalog with search and filtering
- Shopping cart & checkout
- User authentication (email, Google, Facebook)
- Order tracking & history
- Product reviews & ratings

### 👨‍💼 Admin Dashboard (`fog-and-leaf-admin`)

- Complete order management
- Product inventory management
- Customer management
- Sales analytics & reporting
- Stock movement tracking
- Real-time order status updates

### 🔧 Backend API (`Fogbackend`)

- RESTful API with **Express.js**
- PostgreSQL database with **Sequelize ORM**
- JWT authentication
- OAuth integration (Google, Facebook)
- Email & WhatsApp notifications

---

## 🛠️ Tech Stack

### Frontend

- **React 19**
- **Vite**
- **Tailwind CSS**
- **React Router DOM**
- **Axios**
- **Lucide React**

### Backend

- **Node.js** & **Express.js**
- **PostgreSQL**
- **Sequelize ORM**
- **JWT**
- **Passport.js** (OAuth strategies)

---

## 📋 Prerequisites

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **PostgreSQL** v12+ → [Download](https://www.postgresql.org/download/)
- **Git** → [Download](https://git-scm.com/downloads)
- **npm** or **yarn**

---

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/surajc-15/ecommereProject.git
cd fog-and-leafV1
```

### 2. Backend Setup (`Fogbackend`)

```bash
cd Fogbackend
npm install
cp .env.example .env
```

### Configure `.env`

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fogandleaf

# Server
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Email (optional)
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Create tables & seed products

```bash
npm run db:create   # Creates all tables (drops if exists)
npm run db:seed     # Inserts product data
```

### Start Backend Server

```bash
npm run dev
```

API available at: `http://localhost:5000`

---

### 3. Customer Website (`fog-and-leaf`)

```bash
cd ../fog-and-leaf
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

---

### 4. Admin Dashboard (`fog-and-leaf-admin`)

```bash
cd ../fog-and-leaf-admin
npm install
npm run dev
```

Admin dashboard available at: `http://localhost:3002`
Refer the vite config file.
---

## 📁 Project Structure

```
fog-and-leafV1/
├── Fogbackend/
│   ├── config/                 # DB & auth config
│   ├── controllers/            # Route handlers
│   ├── data/                   # Seed/sample data
│   ├── middleware/             # Custom middleware
│   ├── models/                 # Sequelize models
│   ├── routes/                 # API routes
│   ├── scripts/                # DB setup scripts
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── server.js               # Main entry point
│   └── package.json

├── fog-and-leaf/               # Customer website
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── App.jsx
│   ├── public/
│   └── package.json

└── fog-and-leaf-admin/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── utils/
    │   └── App.jsx
    ├── public/
    └── package.json
```

---

## 🐛 Troubleshooting

| Issue                          | Solution                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Database connection fails**  | Ensure PostgreSQL is running. Verify credentials in `.env`. Make sure database exists.                                      |
| **Port conflicts**             | Change `PORT` in `.env`. On Windows, end processes via Task Manager. On Mac/Linux: `lsof -ti:<port> \| xargs kill`.         |
| **Module import errors**       | Run `npm install`. Delete `node_modules` & `package-lock.json`, then reinstall. Clear npm cache: `npm cache clean --force`. |
| **CORS errors**                | Verify backend is running on the correct port. Check frontend `.env` URL. Ensure CORS is enabled in backend.                |
| **Database permission errors** | Ensure PostgreSQL user has `CREATEDB` permission: `ALTER USER postgres CREATEDB;`.                                          |
| **PostgreSQL service issues**  | Make sure PostgreSQL service is running. Restart if necessary.                                                              |
