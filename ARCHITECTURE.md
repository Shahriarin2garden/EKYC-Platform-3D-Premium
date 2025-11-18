# EKYC Platform - System Architecture

## Overview

The EKYC Platform is a modern, microservices-inspired Node.js application for handling Know Your Customer (KYC) verification processes. The system integrates multiple services including MongoDB for data persistence, RabbitMQ for asynchronous processing, AI for intelligent summaries, and PDF generation for documentation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EKYC PLATFORM                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐         ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │◄───────►│   Backend    │◄────►│   MongoDB    │  │
│  │  (React TS)  │   REST  │  (Node.js)   │      │   Database   │  │
│  └──────────────┘   API   └──────┬───────┘      └──────────────┘  │
│                                   │                                 │
│                    ┌──────────────┼──────────────┐                 │
│                    │              │              │                 │
│             ┌──────▼──────┐ ┌────▼─────┐  ┌────▼──────┐          │
│             │  RabbitMQ   │ │ AI Service│ │   PDF     │          │
│             │   Queue     │ │(OpenRouter)│ │ Generator │          │
│             └─────────────┘ └───────────┘ └───────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Services

### 1. **Express Backend Server** (`src/server.js`)

**Role**: Central application orchestrator and API gateway

**Responsibilities**:
- HTTP server setup and routing
- Middleware configuration (CORS, JSON parsing, authentication)
- Global error handling
- Graceful shutdown management
- Health check endpoint

**Key Features**:
- RESTful API endpoints for KYC and Admin operations
- JWT-based authentication
- Request/response logging
- Environment-based configuration

**Startup Process**:
```javascript
1. Load environment variables
2. Initialize logger
3. Connect to MongoDB (async, non-blocking)
4. Start PDF Worker (async, non-blocking)
5. Configure Express middleware
6. Register routes
7. Start HTTP server on port 5000
8. Set up signal handlers (SIGTERM, SIGINT)
```

---

### 2. **MongoDB Database Service** (`src/config/database.js`)

**Role**: Persistent data storage for KYC applications and admin users

**Technology**: MongoDB with Mongoose ODM

**Data Models**:

#### KYC Model (`src/models/Kyc.js`)
```javascript
{
  name: String,
  email: String (unique),
  address: String,
  nid: String,
  occupation: String,
  status: Enum ['pending', 'approved', 'rejected', 'under_review'],
  aiSummary: String,
  pdfPath: String,
  pdfGeneratedAt: Date,
  reviewedBy: ObjectId (Admin),
  reviewedAt: Date,
  submittedAt: Date,
  reviewNotes: String
}
```

#### Admin Model (`src/models/Admin.js`)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: Enum ['admin', 'super_admin'],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

**Connection Features**:
- Automatic reconnection on failure
- Connection event monitoring
- Timeout configuration (5 seconds)
- Environment-based URI (local or MongoDB Atlas)

---

### 3. **RabbitMQ Message Queue** (`src/config/rabbitmq.js`)

**Role**: Asynchronous message broker for PDF generation jobs

**Technology**: AMQP (Advanced Message Queuing Protocol) via `amqplib`

**Queue Configuration**:
- **Queue Name**: `pdf_generation_queue`
- **Durable**: Yes (survives broker restart)
- **Priority Support**: 1-10 (higher = more important)
- **Manual Acknowledgment**: Yes (ensures reliable processing)

**Key Functions**:

```javascript
// Connect to RabbitMQ
connect() → connection

// Get or create channel
getChannel() → channel

// Send message to queue
sendToQueue(queueName, message, options) → boolean

// Consume messages from queue
consumeQueue(queueName, callback, options) → channel

// Get queue statistics
getQueueStats(queueName) → { messageCount, consumerCount }
```

**Message Flow**:
```
1. Admin requests PDF generation
2. Message sent to queue with KYC ID
3. PDF Worker picks up message
4. Worker generates PDF
5. Worker acknowledges message completion
```

**Error Handling**:
- Failed messages can be requeued
- Connection error recovery
- Automatic channel recreation

---

### 4. **PDF Worker Service** (`src/services/pdfWorker.js`)

**Role**: Background worker that processes PDF generation requests

**Operation Mode**: Consumer (listens to RabbitMQ queue)

**Workflow**:

```
┌─────────────────────────────────────────────────────────┐
│ PDF Worker Process                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Connect to RabbitMQ                                 │
│ 2. Subscribe to pdf_generation_queue                   │
│ 3. Set prefetch=1 (one PDF at a time)                 │
│                                                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ For each message received:                   │       │
│ │                                              │       │
│ │ 1. Parse message (kycId, requestedBy, etc)  │       │
│ │ 2. Fetch KYC data from MongoDB              │       │
│ │ 3. Check if recent PDF exists               │       │
│ │ 4. Call PDF Service to generate PDF         │       │
│ │ 5. Update KYC record with PDF path          │       │
│ │ 6. Acknowledge message (remove from queue)   │       │
│ │                                              │       │
│ │ Error? → Log error, optionally requeue      │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Features**:
- One PDF generation at a time (prevents resource overload)
- Automatic requeue on failure
- Duplicate prevention (skips if recent PDF exists)
- Error logging to database
- Graceful shutdown support

---

### 5. **PDF Producer Service** (`src/services/pdfProducer.js`)

**Role**: Interface for requesting PDF generation (enqueues jobs)

**Key Functions**:

```javascript
// Request single PDF generation
requestPdfGeneration(kycId, requestedBy, priority)
  → Sends message to RabbitMQ queue
  → Returns immediately (async)

// Request batch PDF generation
requestBatchPdfGeneration(kycIds, requestedBy, priority)
  → Sends multiple messages to queue
  → Returns results summary

// Get queue status
getQueueStatus()
  → Returns message count and consumer count
```

**Usage in Controllers**:
```javascript
// Admin requests PDF generation
try {
  await pdfProducer.requestPdfGeneration(kycId, adminId, 7);
  // Returns immediately - PDF will be generated async
} catch (error) {
  // Fallback: generate synchronously if RabbitMQ unavailable
}
```

---

### 6. **PDF Generation Service** (`src/services/pdfService.js`)

**Role**: Creates PDF documents from KYC data

**Technology**: PDFKit library

**PDF Contents**:
- Header with logo and title
- KYC application details
- Personal information section
- AI-generated summary (if available)
- Verification status
- Review information
- Footer with generation timestamp

**Process**:
```javascript
1. Create PDFDocument instance
2. Set up write stream to file
3. Add header with styling
4. Add sections (Personal Info, Status, AI Summary, etc)
5. Add footer with metadata
6. Finalize and save PDF
7. Return file path
```

**File Management**:
- PDFs stored in `backend/pdfs/` directory
- Filename format: `kyc_${kycId}_${timestamp}.pdf`
- Functions for deleting old PDFs

---

### 7. **AI Service** (`src/services/aiService.js`)

**Role**: Generate intelligent summaries of KYC applications

**Technology**: OpenRouter SDK (LLM API gateway)

**Default Model**: `meta-llama/llama-3.1-8b-instruct:free`

**Workflow**:

```
┌─────────────────────────────────────────────────────┐
│ AI Summary Generation                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 1. Check if API key configured                     │
│    └─ No? → Use basic summary template            │
│                                                     │
│ 2. Build structured prompt with KYC data          │
│                                                     │
│ 3. Call OpenRouter API                             │
│    - System: Professional KYC analyst              │
│    - User: KYC application details                │
│    - Temperature: 0.3 (consistent output)         │
│    - Max tokens: 400                               │
│                                                     │
│ 4. Extract and clean response                      │
│                                                     │
│ 5. Error? → Fallback to basic summary            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**AI Summary Features**:
- Professional compliance-oriented analysis
- Risk assessment indicators
- Plain text output (no markdown)
- Automatic fallback if API fails
- Rate-limiting aware

**When Generated**:
- On KYC application submission
- On manual regeneration by admin
- On batch regeneration

---

### 8. **Authentication Middleware** (`src/middleware/auth.js`)

**Role**: Protect admin routes with JWT authentication

**Process**:
```
1. Extract JWT from Authorization header
2. Verify token signature and expiration
3. Fetch admin user from database
4. Check if admin is active
5. Attach admin info to request object
6. Call next() or return 401 Unauthorized
```

**Protected Routes**:
- All `/api/admin/*` routes except login/register
- Admin dashboard operations
- KYC status updates
- PDF generation requests

---

## Complete Request Flow Examples

### Example 1: KYC Application Submission

```
┌──────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│ Frontend │    │ Backend │    │ MongoDB │    │ AI API   │
└────┬─────┘    └────┬────┘    └────┬────┘    └────┬─────┘
     │               │              │              │
     │ POST /api/kyc/submit         │              │
     │──────────────►│              │              │
     │               │              │              │
     │               │ Check email exists          │
     │               │─────────────►│              │
     │               │◄─────────────│              │
     │               │              │              │
     │               │ Generate AI summary         │
     │               │─────────────────────────────►│
     │               │◄─────────────────────────────│
     │               │              │              │
     │               │ Save KYC record             │
     │               │─────────────►│              │
     │               │◄─────────────│              │
     │               │              │              │
     │◄──────────────┤              │              │
     │ 201 Created   │              │              │
     │               │              │              │
```

**Steps**:
1. Frontend sends KYC data via POST request
2. Backend validates data
3. Backend checks if email already exists in MongoDB
4. If new, backend calls AI Service to generate summary
5. AI Service calls OpenRouter API (or uses fallback)
6. Backend creates new KYC document in MongoDB
7. Backend returns success response with KYC ID

**Duration**: ~2-5 seconds

---

### Example 2: PDF Generation (Asynchronous)

```
┌──────┐  ┌────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌─────────┐
│Admin │  │Backend │  │PDF       │  │RabbitMQ│  │ PDF      │  │ MongoDB │
│Panel │  │        │  │Producer  │  │        │  │ Worker   │  │         │
└──┬───┘  └───┬────┘  └────┬─────┘  └───┬────┘  └────┬─────┘  └────┬────┘
   │          │            │            │            │            │
   │ Request PDF           │            │            │            │
   │─────────►│            │            │            │            │
   │          │            │            │            │            │
   │          │ Enqueue job│            │            │            │
   │          │───────────►│            │            │            │
   │          │            │ Send msg   │            │            │
   │          │            │───────────►│            │            │
   │◄─────────┤            │            │            │            │
   │ Queued   │            │            │            │            │
   │          │            │            │            │            │
   │          │            │            │ Pick msg   │            │
   │          │            │            │───────────►│            │
   │          │            │            │            │            │
   │          │            │            │            │ Fetch KYC  │
   │          │            │            │            │───────────►│
   │          │            │            │            │◄───────────│
   │          │            │            │            │            │
   │          │            │            │            │ Generate   │
   │          │            │            │            │ PDF        │
   │          │            │            │            │            │
   │          │            │            │            │ Update KYC │
   │          │            │            │            │───────────►│
   │          │            │            │ ACK msg    │            │
   │          │            │            │◄───────────┤            │
   │          │            │            │            │            │
   │ Download PDF (later)  │            │            │            │
   │─────────►│            │            │            │            │
   │◄─────────┤            │            │            │            │
   │ PDF File │            │            │            │            │
   │          │            │            │            │            │
```

**Steps**:
1. Admin clicks "Generate PDF" button
2. Backend receives request, calls PDF Producer
3. PDF Producer sends message to RabbitMQ queue
4. Backend immediately returns "Queued" response
5. PDF Worker picks up message from queue
6. Worker fetches KYC data from MongoDB
7. Worker generates PDF using PDF Service
8. Worker saves PDF to filesystem
9. Worker updates KYC record with PDF path
10. Worker acknowledges message (removes from queue)
11. Later, admin can download PDF via separate request

**Advantages**:
- Non-blocking: Admin doesn't wait for PDF generation
- Scalable: Multiple workers can process queue
- Reliable: Messages persist if worker crashes
- Retryable: Failed jobs can be reprocessed

**Duration**: 
- Response time: ~100ms (instant)
- PDF generation: 1-3 seconds (background)

---

### Example 3: Admin Login and Dashboard

```
┌──────┐  ┌────────┐  ┌─────────┐  ┌─────────┐
│Admin │  │Backend │  │MongoDB  │  │Logger   │
│Panel │  │        │  │         │  │         │
└──┬───┘  └───┬────┘  └────┬────┘  └────┬────┘
   │          │            │            │
   │ POST /api/admin/login │            │
   │─────────►│            │            │
   │          │            │            │
   │          │ Log attempt│            │
   │          │───────────────────────►│
   │          │            │            │
   │          │ Find admin │            │
   │          │───────────►│            │
   │          │◄───────────│            │
   │          │            │            │
   │          │ Verify password         │
   │          │ (bcrypt)   │            │
   │          │            │            │
   │          │ Generate JWT            │
   │          │            │            │
   │          │ Update lastLogin        │
   │          │───────────►│            │
   │          │            │            │
   │◄─────────┤            │            │
   │ JWT Token│            │            │
   │          │            │            │
   │ GET /api/admin/dashboard           │
   │ (with JWT)            │            │
   │─────────►│            │            │
   │          │            │            │
   │          │ Auth middleware         │
   │          │ - Verify JWT            │
   │          │ - Load admin            │
   │          │            │            │
   │          │ Get KYC stats           │
   │          │───────────►│            │
   │          │◄───────────│            │
   │          │            │            │
   │◄─────────┤            │            │
   │Dashboard │            │            │
   │ Data     │            │            │
   │          │            │            │
```

**Steps**:
1. Admin submits login form (email + password)
2. Backend logs authentication attempt
3. Backend queries MongoDB for admin by email
4. Backend verifies password using bcrypt
5. Backend generates JWT token with admin ID
6. Backend updates lastLogin timestamp
7. Backend returns JWT token
8. Frontend stores JWT in localStorage/memory
9. Frontend requests dashboard data with JWT header
10. Auth middleware verifies JWT
11. Auth middleware loads admin from database
12. Backend fetches KYC statistics
13. Backend returns dashboard data

---

## Service Dependencies

```
┌─────────────────────────────────────────────────────┐
│                  Dependency Graph                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│              ┌─────────────┐                       │
│              │   Server    │                       │
│              └──────┬──────┘                       │
│                     │                               │
│        ┏━━━━━━━━━━━━┻━━━━━━━━━━━━┓                │
│        ┃                          ┃                │
│   ┌────▼─────┐              ┌────▼────┐           │
│   │ Database │              │ Logger  │           │
│   └────┬─────┘              └────┬────┘           │
│        │                         │                 │
│        │                    (Used by all)         │
│        │                         │                 │
│   ┌────▼─────┐         ┌─────────▼───────┐       │
│   │Controllers│        │   Middleware    │       │
│   └────┬─────┘         └─────────────────┘       │
│        │                                           │
│        │                                           │
│   ┌────▼─────┐         ┌─────────────┐           │
│   │ Services │────────►│  RabbitMQ   │           │
│   └────┬─────┘         └──────┬──────┘           │
│        │                      │                   │
│   ┌────┼──────────────┬───────┴─────┐            │
│   │    │              │             │            │
│ ┌─▼────▼──┐    ┌─────▼─────┐  ┌───▼──────┐     │
│ │PDF      │    │ AI Service│  │PDF Worker│     │
│ │Service  │    └───────────┘  └──────────┘     │
│ └─────────┘                                      │
│                                                   │
└─────────────────────────────────────────────────────┘
```

### Critical Dependencies

1. **MongoDB** → Required for:
   - KYC data storage
   - Admin authentication
   - PDF metadata

2. **RabbitMQ** → Optional for:
   - Asynchronous PDF generation
   - Fallback: Synchronous generation if unavailable

3. **AI Service (OpenRouter)** → Optional for:
   - Intelligent KYC summaries
   - Fallback: Basic template summary

4. **Logger (Winston)** → Used by all services for:
   - Error tracking
   - Audit trails
   - Debugging

---

## Data Flow Patterns

### Pattern 1: Synchronous Request-Response

**Use Cases**: Login, KYC submission, data retrieval

```
Client → Backend → Database → Backend → Client
        (immediate response)
```

### Pattern 2: Asynchronous Queue-Based

**Use Cases**: PDF generation, batch operations

```
Client → Backend → RabbitMQ
                     ↓
                 PDF Worker → Database
                     ↓
                 (Background)
```

### Pattern 3: Fallback Pattern

**Use Cases**: AI service, RabbitMQ operations

```
Try: Primary service (AI API / RabbitMQ)
  ↓
Catch: Fallback method (Template / Synchronous)
```

---

## Configuration Management

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ekyc_db

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# AI Service
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

### Service Initialization Order

```
1. Logger (always first)
2. Environment variables
3. MongoDB (async, non-blocking)
4. RabbitMQ (async, non-blocking)
5. Express server
6. Routes and middleware
7. Error handlers
8. HTTP server start
9. Signal handlers (SIGTERM, SIGINT)
```

---

## Error Handling Strategy

### Global Error Handler
- Catches all unhandled errors
- Logs with full context
- Returns appropriate HTTP status
- Includes error details in development only

### Specific Error Handlers
- **MongoDB Connection**: Retry logic, exit on persistent failure
- **RabbitMQ Connection**: Fallback to synchronous processing
- **AI Service**: Fallback to basic summary
- **PDF Generation**: Queue reprocessing or error logging

---

## Performance Considerations

### Optimizations

1. **Asynchronous PDF Generation**
   - Prevents blocking API requests
   - Allows parallel processing
   - Handles high load gracefully

2. **MongoDB Indexing**
   - Unique index on email (KYC)
   - Index on status for filtering
   - Index on submittedAt for sorting

3. **Connection Pooling**
   - MongoDB maintains connection pool
   - RabbitMQ channel reuse
   - Prevents connection exhaustion

4. **Caching Strategies**
   - Recent PDF check (skip if < 1 hour old)
   - JWT verification caching (potential)

---

## Monitoring & Observability

### Logging Levels

| Level | Usage |
|-------|-------|
| `error` | Exceptions, failures |
| `warn` | Fallbacks, missing config |
| `info` | Successful operations |
| `http` | API requests |
| `debug` | Detailed debugging |

### Log Files

- `error-*.log`: Error-only logs (30-day retention)
- `combined-*.log`: All logs (30-day retention)
- `http-*.log`: HTTP requests (14-day retention)

### Metrics to Monitor

- API response times
- Queue message count
- PDF generation duration
- AI API usage
- Database query performance
- Error rates by service

---

## Scaling Strategies

### Horizontal Scaling

1. **Multiple Backend Instances**
   - Load balancer in front
   - Session management via JWT (stateless)
   - Shared MongoDB and RabbitMQ

2. **Multiple PDF Workers**
   - Each worker consumes from same queue
   - Work distributed automatically
   - Prevents duplicate processing

### Vertical Scaling

- Increase Node.js worker threads
- Allocate more memory for PDF generation
- Optimize database queries

---

## Security Considerations

### Authentication & Authorization

- JWT-based stateless authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control (admin, super_admin)
- Token expiration (7 days default)

### Data Protection

- Environment variables for secrets
- Password never returned in API responses
- Sensitive data logged with redaction
- CORS configured for specific origins

### API Security

- Rate limiting (recommended for production)
- Input validation with express-validator
- SQL injection prevention via Mongoose
- XSS prevention via input sanitization

---

## Deployment Architecture

### Recommended Production Setup

```
┌─────────────────────────────────────────────────┐
│              Load Balancer (Nginx)              │
└────────────────────┬────────────────────────────┘
                     │
        ┏━━━━━━━━━━━━┻━━━━━━━━━━━━┓
        ┃                          ┃
   ┌────▼─────┐              ┌────▼─────┐
   │ Backend  │              │ Backend  │
   │ Server 1 │              │ Server 2 │
   └────┬─────┘              └────┬─────┘
        │                         │
        └────────┬──────────┬─────┘
                 │          │
        ┌────────▼──┐  ┌────▼─────────┐
        │ MongoDB   │  │ RabbitMQ     │
        │  Cluster  │  │  Cluster     │
        └───────────┘  └──────────────┘
```

### Container Deployment (Docker)

Services defined in `docker-compose.yml`:
- Backend (Node.js)
- Frontend (React + Nginx)
- MongoDB
- RabbitMQ

---

## Troubleshooting Guide

### Service Won't Start

1. **Check MongoDB Connection**
   ```bash
   mongosh "mongodb://localhost:27017/ekyc_db"
   ```

2. **Check RabbitMQ**
   ```bash
   curl http://localhost:15672
   ```

3. **Check Logs**
   ```bash
   tail -f logs/error-*.log
   ```

### PDF Generation Fails

1. Check RabbitMQ connection
2. Verify PDF Worker is running
3. Check filesystem permissions on `pdfs/` directory
4. Review error logs in MongoDB (KYC.pdfError field)

### AI Summaries Not Working

1. Verify `OPENROUTER_API_KEY` in environment
2. Check API credits/quota
3. Review AI service logs
4. Confirm fallback summary is being used

---

## Summary

The EKYC Platform demonstrates a modern microservices architecture with:

✅ **Separation of Concerns**: Each service has a single responsibility  
✅ **Asynchronous Processing**: Background jobs don't block user requests  
✅ **Resilience**: Fallback mechanisms for non-critical services  
✅ **Scalability**: Queue-based architecture supports horizontal scaling  
✅ **Observability**: Comprehensive logging across all services  
✅ **Security**: JWT authentication, password hashing, input validation  

All services work together through well-defined interfaces, message queues, and shared data stores to provide a complete KYC verification solution.
