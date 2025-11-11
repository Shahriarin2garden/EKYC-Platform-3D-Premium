# EKYC System - Electronic Know Your Customer Platform

A modern, full-stack Know Your Customer (KYC) application with **MongoDB database integration**, built with React, TypeScript, Node.js, and Express. This enterprise-ready system provides a complete solution for customer verification, data management, and administrative operations.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

EKYC System is an enterprise-grade solution designed for organizations requiring robust customer verification and data management. The system features a modern React frontend with TypeScript, styled with Tailwind CSS, and a powerful Express.js backend API with MongoDB Atlas database integration for efficient data storage and retrieval.

### Key Capabilities

- **🗄️ MongoDB Integration** - Cloud-based MongoDB Atlas for scalable data storage
- **👤 Customer Verification** - Streamlined KYC form with real-time validation
- **🔐 Admin Portal** - Secure JWT-based authentication and management
- **🤖 AI Integration** - Automated summary generation for applications
- **📊 Dashboard Analytics** - Real-time statistics and status tracking
- **📱 Responsive Design** - Mobile-first approach for all devices
- **🔒 Security** - Password hashing, JWT tokens, and protected routes
- **⚡ Performance** - Indexed database queries and optimized API endpoints

## ✨ Features

### Current Features (v2.0.0) - Production Ready

#### Database & Backend
- ✅ **MongoDB Atlas Integration** - Cloud database with efficient data storage
- ✅ **Mongoose ODM** - Schema validation and data modeling
- ✅ **Database Indexing** - Optimized queries on email, status, and dates
- ✅ **RESTful API** - Complete CRUD operations for KYC and Admin
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Encryption** - bcryptjs for secure password hashing
- ✅ **Data Validation** - Comprehensive input validation and sanitization

#### KYC Management
- ✅ **KYC Submission** - Customer data collection with validation
- ✅ **Status Tracking** - Pending, Approved, Rejected, Under Review
- ✅ **AI Summaries** - Automated summary generation for applications
- ✅ **Pagination** - Efficient data retrieval with pagination support
- ✅ **Search & Filter** - Query KYC applications by status and date
- ✅ **Statistics API** - Dashboard analytics and metrics

#### Admin Features
- ✅ **Admin Registration** - Secure admin account creation
- ✅ **Admin Login** - JWT-based authentication with token management
- ✅ **Protected Routes** - Middleware authentication for secure endpoints
- ✅ **Profile Management** - View and update admin profiles
- ✅ **Password Change** - Secure password update functionality
- ✅ **KYC Review** - Approve, reject, or update application status

#### Frontend
- ✅ **React 18** - Modern UI with hooks and components
- ✅ **TypeScript** - Full type safety across the application
- ✅ **Tailwind CSS** - Beautiful, responsive design
- ✅ **Real-time Validation** - Instant feedback on form inputs
- ✅ **Error Handling** - Comprehensive error messages and feedback
- ✅ **Auto-save Drafts** - LocalStorage integration for form data

### Coming Soon

- 🔲 Admin dashboard with charts and analytics
- 🔲 Document upload and verification
- 🔲 Email notifications
- 🔲 Export data to CSV/PDF
- 🔲 Advanced search and filtering
- 🔲 Dark mode theme
- 🔲 Multi-language support
- 🔲 Real-time updates with WebSockets

## 🛠️ Tech Stack

### Frontend
- **React** 18.2 - Modern UI library with hooks
- **TypeScript** 4.9 - Static type checking
- **Tailwind CSS** 3.3 - Utility-first CSS framework
- **React Router** 6.20 - Client-side routing
- **Axios** 1.6 - Promise-based HTTP client

### Backend
- **Node.js** 16+ - JavaScript runtime environment
- **Express.js** 4.18 - Fast, minimalist web framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose** 8.0 - MongoDB object modeling (ODM)

### Security & Authentication
- **JWT** 9.0 - JSON Web Tokens for authentication
- **bcryptjs** 2.4 - Password hashing and encryption
- **express-validator** 7.0 - Request validation middleware
- **CORS** 2.8 - Cross-Origin Resource Sharing

### Development Tools
- **nodemon** 3.0 - Auto-restart server on changes
- **dotenv** 16.3 - Environment variable management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **MongoDB Atlas Account** (Free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Shahriarin2garden/EKYC-Theme.git
cd EKYC-Theme
```

2. **Set up MongoDB Atlas**

   a. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
   
   b. Create a new cluster (M0 Free tier)
   
   c. Create a database user with read/write permissions
   
   d. Whitelist your IP address (or use 0.0.0.0/0 for development)
   
   e. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

3. **Configure Backend Environment**

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ekyc_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual MongoDB credentials.

4. **Install Dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

5. **Start the Servers**

**Option 1: Start Both Servers (Recommended)**
```bash
# From the root directory
cd backend
node src/server.js   # Terminal 1 - Backend on port 5000

# Open a new terminal
cd frontend
npm start            # Terminal 2 - Frontend on port 3000
```

**Option 2: Using Background Jobs (PowerShell)**
```powershell
# Start backend in background
cd backend
Start-Job -ScriptBlock { Set-Location "YOUR_PROJECT_PATH\backend"; node src/server.js }

# Start frontend
cd ../frontend
npm start
```

6. **Verify Installation**

- Backend API: http://localhost:5000/api/health
- Frontend App: http://localhost:3000

You should see the backend connected to MongoDB Atlas with a success message!

## 📁 Project Structure

```
EKYC-Theme/
├── frontend/                      # React TypeScript Application
│   ├── public/
│   │   └── index.html            # HTML template
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── common/           # Common UI components
│   │   │   │   ├── FormStatus.tsx
│   │   │   │   ├── SecurityBadge.tsx
│   │   │   │   └── SubmitButton.tsx
│   │   │   ├── form/             # Form-specific components
│   │   │   │   ├── InputField.tsx
│   │   │   │   └── TextAreaField.tsx
│   │   │   ├── layout/           # Layout components
│   │   │   │   ├── FormCard.tsx
│   │   │   │   ├── FormContainer.tsx
│   │   │   │   └── FormHeader.tsx
│   │   │   └── index.ts          # Component exports
│   │   ├── pages/                # Page components
│   │   │   ├── KycForm.tsx       # Customer KYC form
│   │   │   ├── AdminLogin.tsx    # Admin login page
│   │   │   └── AdminRegister.tsx # Admin registration
│   │   ├── services/             # API integration
│   │   │   └── api.ts            # Axios API client
│   │   ├── types/                # TypeScript definitions
│   │   │   └── index.ts          # Type declarations
│   │   ├── App.tsx               # Root component with routing
│   │   ├── index.tsx             # Application entry point
│   │   └── index.css             # Tailwind CSS imports
│   ├── package.json
│   ├── tailwind.config.js        # Tailwind configuration
│   └── tsconfig.json             # TypeScript configuration
│
├── backend/                       # Express.js API Server
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   └── database.js       # MongoDB connection setup
│   │   ├── controllers/          # Request handlers
│   │   │   ├── kycController.js  # KYC business logic
│   │   │   └── adminController.js# Admin business logic
│   │   ├── middleware/           # Custom middleware
│   │   │   └── auth.js           # JWT authentication
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── Kyc.js            # KYC data model
│   │   │   ├── Admin.js          # Admin user model
│   │   │   └── index.js          # Model exports
│   │   ├── routes/               # API routes
│   │   │   ├── kycRoutes.js      # KYC endpoints
│   │   │   └── adminRoutes.js    # Admin endpoints
│   │   └── server.js             # Express server setup
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── Dockerfile                # Docker configuration
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── COMPONENTS.md             # Component documentation
│   ├── DEVELOPMENT.md            # Development guide
│   └── QUICKSTART.md             # Quick start guide
│
├── QUICKSTART_MONGODB.md         # MongoDB setup guide
├── docker-compose.yml            # Docker Compose config
├── package.json                  # Root package file
└── README.md                     # This file
```

## ⚙️ Configuration

### Environment Variables

#### Backend Configuration (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration
# Get this from your MongoDB Atlas dashboard
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ekyc_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration

The frontend is configured to connect to the backend API at `http://localhost:5000/api` by default.

To change the API URL, update `frontend/src/services/api.ts`:

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### MongoDB Atlas Setup

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose free M0 tier
3. **Database Access**: Create a user with read/write permissions
4. **Network Access**: Add your IP address (0.0.0.0/0 for development)
5. **Connect**: Get connection string and update `.env` file

For detailed MongoDB setup instructions, see [QUICKSTART_MONGODB.md](./QUICKSTART_MONGODB.md)

## 💻 Development

### API Endpoints

#### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| POST | `/api/kyc/submit` | Submit KYC application |
| POST | `/api/admin/register` | Register new admin |
| POST | `/api/admin/login` | Admin login (returns JWT) |

#### Protected Endpoints (Require JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kyc` | Get all KYC applications (paginated) |
| GET | `/api/kyc/statistics` | Get KYC statistics |
| GET | `/api/kyc/:id` | Get specific KYC by ID |
| PATCH | `/api/kyc/:id/status` | Update KYC status |
| DELETE | `/api/kyc/:id` | Delete KYC application |
| GET | `/api/admin/profile` | Get admin profile |
| PATCH | `/api/admin/profile` | Update admin profile |
| POST | `/api/admin/change-password` | Change admin password |

### Testing the API

#### 1. Test Health Endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

#### 2. Submit KYC Application
```powershell
$body = @{
    name = "John Doe"
    email = "john.doe@example.com"
    address = "123 Main Street, New York"
    nid = "NID-123456"
    occupation = "Software Engineer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/submit" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### 3. Admin Registration
```powershell
$adminBody = @{
    name = "Admin User"
    email = "admin@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $adminBody
```

#### 4. Admin Login & Get Token
```powershell
$loginBody = @{
    email = "admin@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $response.data.token
```

#### 5. Get All KYC Applications (Protected)
```powershell
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc" -Headers $headers
```

### Database Schema

#### KYC Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-100 chars),
  email: String (required, unique, indexed),
  address: String (optional, max 500 chars),
  nid: String (optional, indexed),
  occupation: String (optional, max 100 chars),
  aiSummary: String,
  status: String (enum: ['pending', 'approved', 'rejected', 'under_review']),
  submittedAt: Date (default: now, indexed),
  updatedAt: Date (auto-managed),
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: Admin),
  reviewNotes: String
}
```

#### Admin Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-100 chars),
  email: String (required, unique, indexed),
  password: String (required, hashed, min 8 chars),
  role: String (enum: ['admin', 'super_admin'], default: 'admin'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date (auto-managed),
  updatedAt: Date (auto-managed)
}
```

### Frontend Development

```bash
cd frontend
npm start          # Start dev server (http://localhost:3000)
npm test           # Run tests
npm run build      # Build for production
npm run lint       # Run ESLint
```

### Backend Development

```bash
cd backend
node src/server.js # Start server
npm test           # Run tests (when available)
```

### Code Quality

- ✅ **TypeScript** - Static type checking
- ✅ **Component-based** - Modular React architecture
- ✅ **Mongoose Validation** - Schema-level data validation
- ✅ **JWT Security** - Token-based authentication
- ✅ **Password Hashing** - bcryptjs encryption
- ✅ **Error Handling** - Comprehensive error management
- ✅ **API Validation** - Request validation middleware

## 🚢 Deployment

### Frontend Deployment

#### Build for Production
```bash
cd frontend
npm run build
```

#### Deploy Options

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**Other Platforms**
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages
- Firebase Hosting

### Backend Deployment

#### Environment Setup

Ensure your production `.env` file contains:
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_production_secret
PORT=5000
```

#### Deploy Options

**Heroku**
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_secret"
git push heroku master
```

**Railway**
```bash
# Install Railway CLI
railway login
railway init
railway up
```

**DigitalOcean App Platform**
- Connect your GitHub repository
- Configure environment variables
- Deploy automatically on push

**AWS EC2 / Elastic Beanstalk**
- Launch EC2 instance
- Install Node.js and dependencies
- Configure PM2 for process management
- Set up Nginx as reverse proxy

#### Docker Deployment

Build and run with Docker:
```bash
# Build image
docker build -t ekyc-backend ./backend

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_secret" \
  ekyc-backend
```

Or use Docker Compose:
```bash
docker-compose up -d
```

### Production Checklist

- [ ] Update `MONGODB_URI` with production database
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for production domains
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Test all API endpoints

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: bad auth : authentication failed
```
**Solution:** Check your MongoDB credentials in `.env` file. Ensure password is correct and doesn't contain special characters that need URL encoding.

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the existing process
```powershell
taskkill /F /IM node.exe
```

#### CORS Error
```
Access to fetch has been blocked by CORS policy
```
**Solution:** Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL.

### Performance Optimization

- MongoDB indexes are automatically created on: `email`, `status`, `submittedAt`
- Use pagination for large datasets (default: 10 items per page)
- Implement caching for frequently accessed data
- Use MongoDB Atlas performance advisor for query optimization

## 📚 Documentation

- [MongoDB Setup Guide](./QUICKSTART_MONGODB.md) - Detailed MongoDB configuration
- [Architecture Documentation](./docs/ARCHITECTURE.md) - System architecture
- [Component Guide](./docs/COMPONENTS.md) - React component documentation
- [Development Guide](./docs/DEVELOPMENT.md) - Development best practices

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Test thoroughly (backend API and frontend UI)
5. Commit your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. Push to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request

### Code Standards

- Follow existing code style
- Add comments for complex logic
- Update documentation for API changes
- Test all changes before submitting PR
- Ensure no console errors or warnings

## �📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Developed as part of an internship program at SELISE.

## 👨‍💻 Author

**Shahriar Hossain**
- 📧 Email: shahriarhossain197@gmail.com
- 🐙 GitHub: [@Shahriarin2garden](https://github.com/Shahriarin2garden)
- 💼 LinkedIn: [Shahriar Hossain](https://linkedin.com/in/shahriar-hossain)

## 🙏 Acknowledgments

- **MongoDB** - For providing free Atlas tier and excellent documentation
- **React Team** - For the amazing frontend framework
- **Tailwind CSS** - For the utility-first CSS approach
- **TypeScript** - For bringing type safety to JavaScript
- **Express.js** - For the minimalist web framework
- **SELISE** - For the internship opportunity
- **Open Source Community** - For inspiration and support

## 📊 Project Statistics

- **Lines of Code:** ~5,000+
- **Components:** 15+ React components
- **API Endpoints:** 12+ RESTful endpoints
- **Database Models:** 2 Mongoose schemas
- **Features:** 25+ implemented features

## 🎯 Project Roadmap

### Phase 1: Core Features (Completed ✅)
- [x] Frontend with React & TypeScript
- [x] Backend API with Express
- [x] MongoDB Integration
- [x] Authentication System
- [x] KYC Submission & Management

### Phase 2: Enhanced Features (In Progress 🚧)
- [ ] Admin Dashboard with Analytics
- [ ] Document Upload System
- [ ] Email Notifications
- [ ] Advanced Search & Filters

### Phase 3: Advanced Features (Planned 📋)
- [ ] Real-time Updates (WebSockets)
- [ ] Multi-language Support
- [ ] Mobile App (React Native)
- [ ] AI-powered Document Verification

---

## ⭐ Show Your Support

If you find this project helpful, please consider giving it a ⭐️ on GitHub!

---

**Version:** 2.0.0  
**Last Updated:** November 11, 2025  
**Status:** Production Ready 🚀
