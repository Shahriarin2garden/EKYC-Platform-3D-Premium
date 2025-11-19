# Backend Structure

Backend API server for EKYC system with PDF generation capability using RabbitMQ.

## Directory Structure

```text
backend/
├── src/
│   ├── server.js          # Main server file
│   ├── config/            # Configuration files
│   │   ├── database.js    # MongoDB configuration
│   │   └── rabbitmq.js    # RabbitMQ configuration
│   ├── controllers/       # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   │   ├── aiService.js         # AI integration
│   │   ├── pdfService.js        # PDF generation
│   │   ├── pdfWorker.js         # RabbitMQ consumer
│   │   └── pdfProducer.js       # RabbitMQ producer
│   └── utils/             # Utility functions
├── pdfs/                  # Generated PDF files
├── .env                   # Environment variables
├── package.json           # Dependencies
├── PDF_QUICKSTART.md      # Quick start guide for PDF
└── PDF_GENERATION_GUIDE.md # Detailed PDF documentation
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file:

   ```bash
   cp .env.example .env
   ```

3. Update environment variables in `.env`

4. Start server:

   ```bash
   npm run dev    # Development mode
   npm start      # Production mode
   ```

## Features

- ✅ **RESTful API** - Clean and organized API structure
- ✅ **MongoDB Integration** - Persistent data storage
- ✅ **JWT Authentication** - Secure admin authentication
- ✅ **AI-Powered Analysis** - Automated KYC review using OpenRouter AI
- ✅ **PDF Generation** - Asynchronous PDF generation with RabbitMQ
- ✅ **Queue Management** - Priority-based message queue
- ✅ **Error Handling** - Comprehensive error handling and logging

## API Endpoints

### Health Check

- GET `/api/health` - Server status

### KYC

- POST `/api/kyc/submit` - Submit KYC application
- GET `/api/kyc` - Get all KYC applications (Admin)
- GET `/api/kyc/:id` - Get KYC by ID (Admin)
- PATCH `/api/kyc/:id/status` - Update KYC status (Admin)
- POST `/api/kyc/:id/regenerate-summary` - Regenerate AI summary (Admin)
- DELETE `/api/kyc/:id` - Delete KYC application (Admin)

### Admin

- POST `/api/admin/register` - Admin registration
- POST `/api/admin/login` - Admin login
- GET `/api/admin/profile` - Get admin profile
- PATCH `/api/admin/profile` - Update admin profile
- POST `/api/admin/change-password` - Change password
- GET `/api/admin/all` - Get all admins

### PDF Generation (Admin Only)

- POST `/api/admin/kyc/:kycId/generate-pdf` - Request PDF generation
- GET `/api/admin/kyc/:kycId/download-pdf` - Download generated PDF
- GET `/api/admin/kyc/:kycId/pdf-status` - Check PDF generation status
- POST `/api/admin/kyc/batch-generate-pdf` - Batch generate PDFs
- GET `/api/admin/pdf-queue-status` - Get RabbitMQ queue status

## Quick Start with PDF Generation

### 1. Install RabbitMQ

**Windows:**

```powershell
.\setup-rabbitmq.ps1
```

**macOS/Linux:**

```bash
brew install rabbitmq  # macOS
# or
sudo apt-get install rabbitmq-server  # Linux
```

### 2. Start RabbitMQ

```bash
rabbitmq-server
```

### 3. Configure Environment

Add to `.env`:

```env
RABBITMQ_URL=amqp://localhost:5672
```

### 4. Start Server

```bash
npm install
npm start
```

For detailed PDF generation documentation, see [PDF_QUICKSTART.md](./PDF_QUICKSTART.md)
