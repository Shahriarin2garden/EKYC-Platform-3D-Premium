# EKYC System - Electronic Know Your Customer Platform

A modern, full-stack Know Your Customer (KYC) application with MongoDB database integration, AI-powered summaries, and automated PDF report generation. Built with React, TypeScript, Node.js, Express, and RabbitMQ, this enterprise-ready system provides a complete solution for customer verification, data management, and administrative operations.

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

EKYC System is an enterprise-grade solution designed for organizations requiring robust customer verification and data management. The system features a modern React frontend with TypeScript, styled with Tailwind CSS, and a powerful Express.js backend API with MongoDB Atlas database integration for efficient data storage and retrieval.

### 🎥 Demo Video

Watch a complete demonstration of the EKYC Platform in action:

**[📹 Download Demo Video](https://github.com/Shahriarin2garden/EKYC-Platform/raw/master/demos/ekyc-demo.mp4)**

The demo showcases:
- Modern UI with glassmorphism effects and smooth animations
- KYC form submission with real-time validation
- Admin authentication and dashboard
- Application management and status updates
- PDF generation and download functionality
- AI-powered summary generation

> **Note:** Click the link above to download the demo video. The video is also available in the `demos/` folder when you clone the repository.

### Key Capabilities

- **MongoDB Integration** - Cloud-based MongoDB Atlas for scalable data storage
- **Customer Verification** - Streamlined KYC form with real-time validation
- **Admin Portal** - Secure JWT-based authentication and management
- **AI Integration** - Automated summary generation for applications using OpenRouter API
- **PDF Generation** - Automated PDF report generation with queue-based processing
- **Dashboard Analytics** - Real-time statistics and status tracking
- **Responsive Design** - Mobile-first approach for all devices
- **Security** - Password hashing, JWT tokens, and protected routes
- **Performance** - Indexed database queries and optimized API endpoints

## Features

### Current Features (v2.1.0) - Production Ready

#### Database & Backend
- **MongoDB Atlas Integration** - Cloud database with efficient data storage
- **Mongoose ODM** - Schema validation and data modeling
- **Database Indexing** - Optimized queries on email, status, and dates
- **RESTful API** - Complete CRUD operations for KYC and Admin
- **JWT Authentication** - Secure token-based authentication
- **Password Encryption** - bcryptjs for secure password hashing
- **Data Validation** - Comprehensive input validation and sanitization

#### KYC Management
- **KYC Submission** - Customer data collection with validation
- **Status Tracking** - Pending, Approved, Rejected, Under Review
- **AI Summaries** - Automated summary generation using OpenRouter API
- **PDF Generation** - Professional PDF reports with queue-based processing
- **Pagination** - Efficient data retrieval with pagination support
- **Search & Filter** - Query KYC applications by status and date
- **Statistics API** - Dashboard analytics and metrics

#### PDF Generation System (New in v2.1.0)
- **Automated PDF Reports** - Generate professional KYC application reports
- **Queue-Based Processing** - RabbitMQ integration for asynchronous PDF generation
- **Synchronous Fallback** - Works without RabbitMQ for immediate PDF creation
- **Batch Generation** - Generate multiple PDFs simultaneously
- **PDF Status Tracking** - Monitor generation progress and errors
- **Download Management** - Direct download from admin dashboard
- **Professional Formatting** - Color-coded status badges, headers, and structured layout

#### Admin Features
- **Admin Registration** - Secure admin account creation
- **Admin Login** - JWT-based authentication with token management
- **Protected Routes** - Middleware authentication for secure endpoints
- **Profile Management** - View and update admin profiles
- **Password Change** - Secure password update functionality
- **KYC Review** - Approve, reject, or update application status
- **PDF Operations** - Generate, download, and manage PDF reports

#### Frontend
- **React 18** - Modern UI with hooks and components
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Beautiful, responsive design
- **Real-time Validation** - Instant feedback on form inputs
- **Error Handling** - Comprehensive error messages and feedback
- **Auto-save Drafts** - LocalStorage integration for form data
- **PDF Button Component** - Interactive PDF generation with status indicators

### Coming Soon

- Admin dashboard with charts and analytics
- Document upload and verification
- Email notifications
- Advanced search and filtering
- Dark mode theme
- Multi-language support
- Real-time updates with WebSockets

## Tech Stack

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
- **RabbitMQ** - Message queue for asynchronous processing (optional)
- **PDFKit** 0.17 - PDF document generation library

### AI & Integrations
- **OpenRouter API** - AI-powered summary generation
- **@openrouter/sdk** 0.1.10 - OpenRouter SDK integration

### Security & Authentication
- **JWT** 9.0 - JSON Web Tokens for authentication
- **bcryptjs** 2.4 - Password hashing and encryption
- **express-validator** 7.0 - Request validation middleware
- **CORS** 2.8 - Cross-Origin Resource Sharing

### Message Queue & PDF Processing
- **amqplib** 0.10.9 - RabbitMQ client for Node.js
- **PDFKit** 0.17.2 - Professional PDF document generation

### Development Tools
- **nodemon** 3.0 - Auto-restart server on changes
- **dotenv** 16.3 - Environment variable management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Prerequisites

**Option 1: Docker (Recommended - Easiest Setup)**
- **Docker Desktop** 20.10+ ([Download](https://www.docker.com/products/docker-desktop/))
- **Docker Compose** 2.0+ (included with Docker Desktop)
- **Git** ([Download](https://git-scm.com/))

**Option 2: Manual Setup**
- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **MongoDB Atlas Account** (Free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))
- **RabbitMQ** (Optional, for asynchronous PDF generation) ([Download](https://www.rabbitmq.com/download.html))
- **OpenRouter API Key** (Optional, for AI summaries) ([Get API Key](https://openrouter.ai/))

### Quick Start

#### 🐳 Option 1: Docker Setup (Recommended)

The fastest way to get started! All services (MongoDB, RabbitMQ, Backend, Frontend) run in containers.

1. **Clone and Setup**
```bash
git clone https://github.com/Shahriarin2garden/EKYC-Theme.git
cd EKYC-Theme

# Copy environment file
cp .env.example .env
```

2. **Run Quick Start Script**

**Windows (PowerShell):**
```powershell
.\docker-start.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- RabbitMQ Console: http://localhost:15672 (admin/admin123)

**That's it!** All services are running with a single command. See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed documentation.

---

#### Option 2: Manual Setup

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

# OpenRouter API Configuration (Optional - for AI summaries)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# RabbitMQ Configuration (Optional - for async PDF generation)
RABBITMQ_URL=amqp://localhost:5672
```

**Important:** 
- Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual MongoDB credentials.
- Add `OPENROUTER_API_KEY` if you want AI-powered summaries (get it from [OpenRouter](https://openrouter.ai/))
- Add `RABBITMQ_URL` if you want asynchronous PDF generation (system works without RabbitMQ)

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

### Optional: Set up AI Summaries

To enable AI-powered summaries:
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add to backend `.env`: `OPENROUTER_API_KEY=your_key_here`
4. Restart the backend server

### Optional: Set up RabbitMQ for Async PDF Generation

To enable queue-based PDF generation:
1. Install RabbitMQ from [rabbitmq.com](https://www.rabbitmq.com/download.html)
2. Start RabbitMQ service
3. Add to backend `.env`: `RABBITMQ_URL=amqp://localhost:5672`
4. Restart the backend server

**Note:** PDF generation works without RabbitMQ using synchronous processing.

## Project Structure

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
│   │   │   │   ├── SubmitButton.tsx
│   │   │   │   └── PdfButton.tsx  # PDF generation button
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
│   │   │   ├── AdminRegister.tsx # Admin registration
│   │   │   └── AdminDashboard.tsx# Admin dashboard with PDF
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
│   │   │   ├── database.js       # MongoDB connection setup
│   │   │   └── rabbitmq.js       # RabbitMQ configuration
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
│   │   ├── services/             # Business services
│   │   │   ├── aiService.js      # OpenRouter AI integration
│   │   │   ├── pdfService.js     # PDF generation service
│   │   │   ├── pdfWorker.js      # RabbitMQ PDF consumer
│   │   │   └── pdfProducer.js    # RabbitMQ PDF producer
│   │   └── server.js             # Express server setup
│   ├── pdfs/                     # Generated PDF storage
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
├── AI_SUMMARY_QUICKSTART.md      # AI integration guide
├── QUICKSTART_MONGODB.md         # MongoDB setup guide
├── docker-compose.yml            # Docker Compose config
├── package.json                  # Root package file
└── README.md                     # This file
```

## Configuration

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

# OpenRouter API Configuration (Optional)
OPENROUTER_API_KEY=your_openrouter_api_key

# RabbitMQ Configuration (Optional)
RABBITMQ_URL=amqp://localhost:5672
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

## Testing

The project includes comprehensive unit testing coverage for both backend and frontend.

### Quick Start

```bash
# Run all tests
npm run test:all

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run with coverage
npm run test:coverage
```

### Test Coverage

- ✅ **Backend Tests** (8 test suites)
  - Models: Admin, KYC
  - Controllers: Admin, KYC
  - Middleware: Authentication
  - Services: AI Service, PDF Service

- ✅ **Frontend Tests** (6 test suites)
  - Components: FormStatus, InputField
  - Pages: KycForm, AdminLogin, AdminDashboard
  - Services: API client

### Testing Stack

- **Backend**: Jest, Supertest, MongoDB Memory Server
- **Frontend**: Jest, React Testing Library, jest-dom

### Documentation

For detailed testing documentation, see:
- [TESTING.md](./TESTING.md) - Complete testing guide
- [TEST_COMMANDS.md](./TEST_COMMANDS.md) - Quick command reference

## Development

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

#### PDF Generation Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/kyc/:id/generate-pdf` | Generate PDF report for KYC |
| GET | `/api/admin/kyc/:id/download-pdf` | Download generated PDF |
| GET | `/api/admin/kyc/:id/pdf-status` | Check PDF generation status |
| POST | `/api/admin/kyc/batch-generate-pdf` | Batch generate multiple PDFs |
| GET | `/api/admin/pdf-queue-status` | Get PDF queue statistics |

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
  reviewNotes: String,
  pdfPath: String,
  pdfGeneratedAt: Date,
  pdfError: String,
  pdfErrorAt: Date
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

- **TypeScript** - Static type checking
- **Component-based** - Modular React architecture
- **Mongoose Validation** - Schema-level data validation
- **JWT Security** - Token-based authentication
- **Password Hashing** - bcryptjs encryption
- **Error Handling** - Comprehensive error management
- **API Validation** - Request validation middleware
- **PDF Generation** - Professional document creation with PDFKit
- **Queue System** - RabbitMQ for async processing (optional)

## Deployment

### 🐳 Docker Deployment (Recommended)

The simplest way to deploy is using Docker:

```bash
# Production deployment
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

For detailed Docker deployment instructions, see [DOCKER_GUIDE.md](./DOCKER_GUIDE.md).

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
OPENROUTER_API_KEY=your_openrouter_key (optional)
RABBITMQ_URL=your_rabbitmq_url (optional)
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
- [ ] Configure RabbitMQ for production (optional)
- [ ] Set up PDF storage directory permissions
- [ ] Add OpenRouter API key for AI features (optional)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

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

#### RabbitMQ Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5672
```
**Solution:** This is expected if RabbitMQ is not installed. The system will automatically use synchronous PDF generation as a fallback. To enable async processing, install and start RabbitMQ.

#### PDF Generation Not Working
```
Failed to generate PDF
```
**Solution:** 
1. Check that the `backend/pdfs/` directory exists and is writable
2. Verify PDFKit is installed: `npm list pdfkit`
3. Check server logs for specific error messages
4. PDF generation works without RabbitMQ (synchronous fallback)

#### AI Summary Not Generating
```
AI summary generation failed
```
**Solution:** 
1. Verify `OPENROUTER_API_KEY` is set in `.env`
2. Check API key is valid at [OpenRouter Dashboard](https://openrouter.ai/)
3. Ensure you have API credits available
4. Check network connectivity to OpenRouter API

### Performance Optimization

- MongoDB indexes are automatically created on: `email`, `status`, `submittedAt`
- Use pagination for large datasets (default: 10 items per page)
- Implement caching for frequently accessed data
- Use MongoDB Atlas performance advisor for query optimization
- RabbitMQ enables asynchronous PDF generation for better performance
- PDFs are stored locally in `backend/pdfs/` directory

## Documentation

- [MongoDB Setup Guide](./QUICKSTART_MONGODB.md) - Detailed MongoDB configuration
- [AI Integration Guide](./AI_SUMMARY_QUICKSTART.md) - OpenRouter AI setup
- [Architecture Documentation](./docs/ARCHITECTURE.md) - System architecture
- [Component Guide](./docs/COMPONENTS.md) - React component documentation
- [Development Guide](./docs/DEVELOPMENT.md) - Development best practices

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Developed as part of an internship program at SELISE.

## Author

**Shahriar Hossain**
- Email: shahriarhossain197@gmail.com
- GitHub: [@Shahriarin2garden](https://github.com/Shahriarin2garden)
- LinkedIn: [Shahriar Hossain](https://linkedin.com/in/shahriar-hossain)

## Acknowledgments

- **MongoDB** - For providing free Atlas tier and excellent documentation
- **React Team** - For the amazing frontend framework
- **Tailwind CSS** - For the utility-first CSS approach
- **TypeScript** - For bringing type safety to JavaScript
- **Express.js** - For the minimalist web framework
- **PDFKit** - For professional PDF generation capabilities
- **RabbitMQ** - For reliable message queuing system
- **OpenRouter** - For AI-powered summary generation
- **SELISE** - For the internship opportunity
- **Open Source Community** - For inspiration and support

## Project Statistics

- **Lines of Code:** ~7,500+
- **Components:** 18+ React components
- **API Endpoints:** 17+ RESTful endpoints
- **Database Models:** 2 Mongoose schemas with indexes
- **Features:** 30+ implemented features
- **Services:** 5 backend services (AI, PDF generation, queue processing)

## Project Roadmap

### Phase 1: Core Features (Completed)
- [x] Frontend with React & TypeScript
- [x] Backend API with Express
- [x] MongoDB Integration
- [x] Authentication System
- [x] KYC Submission & Management
- [x] AI-powered Summary Generation
- [x] PDF Report Generation
- [x] Queue-based Processing with RabbitMQ

### Phase 2: Enhanced Features (In Progress)
- [ ] Admin Dashboard with Analytics
- [ ] Document Upload System
- [ ] Email Notifications
- [ ] Advanced Search & Filters
- [ ] Bulk PDF Export

### Phase 3: Advanced Features (Planned)
- [ ] Real-time Updates (WebSockets)
- [ ] Multi-language Support
- [ ] Mobile App (React Native)
- [ ] AI-powered Document Verification
- [ ] Automated Compliance Checks

---

## Show Your Support

If you find this project helpful, please consider giving it a star on GitHub!

---

**Version:** 2.1.0  
**Last Updated:** November 12, 2025  
**Status:** Production Ready with PDF Generation
