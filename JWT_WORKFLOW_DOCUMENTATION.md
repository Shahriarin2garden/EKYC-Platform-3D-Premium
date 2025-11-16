# JWT Token Workflow - EKYC Platform

## 🔐 Complete JWT Authentication Flow

---

## 1️⃣ **JWT TOKEN GENERATION**

### Location: `backend/src/models/Admin.js`

```javascript
// Instance method to generate JWT token
adminSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,          // Admin's MongoDB ObjectId
    email: this.email,     // Admin's email
    role: this.role        // 'admin' or 'super_admin'
  };

  const secret = process.env.JWT_SECRET || 'default_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};
```

**JWT Payload Structure:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1700140800,    // Issued at (auto-added by jwt.sign)
  "exp": 1700745600     // Expires at (auto-added by jwt.sign)
}
```

---

## 2️⃣ **WHERE JWT IS GENERATED (Called)**

### A. Admin Registration - `POST /api/admin/register`

**File:** `backend/src/controllers/adminController.js`

```javascript
exports.register = async (req, res) => {
  // 1. Extract data from request
  const { name, email, password } = req.body;

  // 2. Create new admin in database
  const admin = new Admin({ name, email, password });
  await admin.save();

  // 3. GENERATE JWT TOKEN ← HERE
  const token = admin.generateAuthToken();

  // 4. Send token to client
  res.status(201).json({
    success: true,
    message: 'Admin registered successfully',
    data: {
      token,  // ← JWT token sent to frontend
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }
  });
};
```

**Flow:**
```
Client Request          Backend Processing              Database              Client Response
     │                         │                            │                         │
     │  POST /api/admin/       │                            │                         │
     │  register               │                            │                         │
     ├────────────────────────>│                            │                         │
     │  { name, email, pwd }   │                            │                         │
     │                         │                            │                         │
     │                         │  Save Admin                │                         │
     │                         ├───────────────────────────>│                         │
     │                         │                            │                         │
     │                         │  Admin Created             │                         │
     │                         │<───────────────────────────┤                         │
     │                         │                            │                         │
     │                         │  admin.generateAuthToken() │                         │
     │                         │  ─────────────────────────>│                         │
     │                         │         JWT Token          │                         │
     │                         │                            │                         │
     │                         │    { success, token, ... } │                         │
     │                         ├────────────────────────────┼────────────────────────>│
     │                         │                            │                         │
     │                         │                            │    Token stored in      │
     │                         │                            │    localStorage         │
```

---

### B. Admin Login - `POST /api/admin/login`

**File:** `backend/src/controllers/adminController.js`

```javascript
exports.login = async (req, res) => {
  // 1. Validate credentials
  const { email, password } = req.body;
  const admin = await Admin.findByCredentials(email, password);

  // 2. Update last login
  await admin.updateLastLogin();

  // 3. GENERATE JWT TOKEN ← HERE
  const token = admin.generateAuthToken();

  // 4. Send token to client
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,  // ← JWT token sent to frontend
      admin: { /* admin details */ }
    }
  });
};
```

---

## 3️⃣ **JWT TOKEN VALIDATION**

### Location: `backend/src/middleware/auth.js`

```javascript
const auth = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // 2. Extract the actual token (remove 'Bearer ' prefix)
    const token = authHeader.replace('Bearer ', '');

    // 3. Verify token using JWT secret
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    const decoded = jwt.verify(token, secret);  // ← VALIDATION HAPPENS HERE

    // 4. Find admin in database
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin account is inactive'
      });
    }

    // 5. Attach admin info to request object
    req.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    };

    // 6. Continue to next middleware/controller
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};
```

**Validation Flow:**
```
1. Extract Token:     "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            ↓
2. Verify Token:      jwt.verify(token, JWT_SECRET)
                            ↓
3. Decode Payload:    { id: "507f1f...", email: "admin@...", role: "admin" }
                            ↓
4. Find Admin:        Admin.findById(decoded.id)
                            ↓
5. Check Active:      admin.isActive === true
                            ↓
6. Attach to Req:     req.admin = { id, email, role }
                            ↓
7. Continue:          next()
```

---

## 4️⃣ **WHERE JWT IS VALIDATED (Protected Routes)**

### Admin Routes - `backend/src/routes/adminRoutes.js`

```javascript
// Protected routes (require authentication)
router.get('/profile', auth, adminController.getProfile);
//                     ^^^^
//              Auth middleware validates JWT here

router.patch('/profile', auth, adminController.updateProfile);
router.post('/change-password', auth, adminController.changePassword);
router.get('/all', auth, adminController.getAllAdmins);

// PDF generation routes
router.post('/kyc/:kycId/generate-pdf', auth, adminController.generatePdf);
router.get('/kyc/:kycId/download-pdf', auth, adminController.downloadPdf);
router.get('/kyc/:kycId/pdf-status', auth, adminController.getPdfStatus);
router.post('/kyc/batch-generate-pdf', auth, adminController.batchGeneratePdf);
router.get('/pdf-queue-status', auth, adminController.getPdfQueueStatus);
```

### KYC Routes - `backend/src/routes/kycRoutes.js`

```javascript
// Protected routes (require admin authentication)
router.get('/', auth, kycController.getAllKyc);
//              ^^^^
//       Auth middleware validates JWT here

router.get('/statistics', auth, kycController.getKycStatistics);
router.get('/:id', auth, kycController.getKycById);
router.patch('/:id/status', auth, kycController.updateKycStatus);
router.post('/:id/regenerate-summary', auth, kycController.regenerateAiSummary);
router.post('/batch-regenerate-summaries', auth, kycController.batchRegenerateAiSummaries);
router.delete('/:id', auth, kycController.deleteKyc);
```

---

## 5️⃣ **FRONTEND JWT HANDLING**

### Location: `frontend/src/services/api.ts`

```typescript
// Request interceptor - Adds JWT to every request
apiClient.interceptors.request.use(
  (config) => {
    // 1. Retrieve token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // 2. Add token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handles unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 3. Token is invalid/expired - clear and redirect
      localStorage.removeItem('token');
      globalThis.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);
```

---

## 6️⃣ **COMPLETE REQUEST FLOW WITH JWT**

### Example: Admin Gets KYC Statistics

```
┌──────────────┐
│   Frontend   │
│   Browser    │
└──────┬───────┘
       │
       │ 1. User clicks "View Statistics"
       │
       ├──> GET /api/kyc/statistics
       │    Headers: { 
       │      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       │    }
       │
       ↓
┌──────────────────────────────────────────────────────────────┐
│                       Backend Server                          │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  1. Express receives request                       │     │
│  └──────────────────┬─────────────────────────────────┘     │
│                     │                                         │
│  ┌──────────────────▼─────────────────────────────────┐     │
│  │  2. Auth Middleware (auth.js)                      │     │
│  │     • Extract token from header                    │     │
│  │     • Verify with JWT_SECRET                       │     │
│  │     • Decode payload: { id, email, role }          │     │
│  │     • Find admin in database                       │     │
│  │     • Check if admin.isActive                      │     │
│  │     • Attach req.admin = { id, email, role }       │     │
│  └──────────────────┬─────────────────────────────────┘     │
│                     │                                         │
│           ┌─────────▼─────────────┐                          │
│           │  Token Valid?         │                          │
│           └─────────┬─────────────┘                          │
│                     │                                         │
│        ┌────────────┼────────────┐                           │
│        │            │            │                           │
│     YES│            │            │NO                         │
│        │            │            │                           │
│        ▼            │            ▼                           │
│  ┌─────────────┐   │   ┌─────────────────┐                 │
│  │  3. Call    │   │   │  Return 401     │                 │
│  │  Controller │   │   │  Unauthorized   │                 │
│  │  Function   │   │   └────────┬────────┘                 │
│  └──────┬──────┘   │            │                           │
│         │          │            │                           │
│         │          │            │                           │
│  ┌──────▼──────┐   │            │                           │
│  │  4. Access  │   │            │                           │
│  │  req.admin  │   │            │                           │
│  │  data       │   │            │                           │
│  └──────┬──────┘   │            │                           │
│         │          │            │                           │
│  ┌──────▼──────┐   │            │                           │
│  │  5. Query   │   │            │                           │
│  │  Database   │   │            │                           │
│  └──────┬──────┘   │            │                           │
│         │          │            │                           │
│  ┌──────▼──────┐   │            │                           │
│  │  6. Return  │   │            │                           │
│  │  Response   │   │            │                           │
│  └──────┬──────┘   │            │                           │
│         │          │            │                           │
└─────────┼──────────┼────────────┼───────────────────────────┘
          │          │            │
          ▼          │            ▼
┌──────────────┐     │    ┌──────────────┐
│   Frontend   │     │    │   Frontend   │
│              │     │    │              │
│  Success:    │     │    │  Error 401:  │
│  Display     │     │    │  Redirect to │
│  Statistics  │     │    │  Login Page  │
└──────────────┘     │    └──────────────┘
                     │
```

---

## 7️⃣ **JWT TOKEN LIFECYCLE**

### Stage 1: Registration/Login
```javascript
// Admin logs in
POST /api/admin/login
{
  "email": "admin@example.com",
  "password": "securePassword123"
}

// Backend generates token
const token = admin.generateAuthToken();

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2Y...",
    "admin": { ... }
  }
}
```

### Stage 2: Token Storage
```javascript
// Frontend stores token
localStorage.setItem('token', response.data.data.token);
```

### Stage 3: Token Usage
```javascript
// Every subsequent request includes token
axios.get('/api/kyc/statistics', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### Stage 4: Token Validation
```javascript
// Backend middleware validates on every protected route
const decoded = jwt.verify(token, JWT_SECRET);
// If valid: continues to controller
// If invalid: returns 401
```

### Stage 5: Token Expiration
```javascript
// After 7 days (default), token expires
// Backend returns: { message: "Token expired" }
// Frontend: removes token and redirects to login
```

---

## 8️⃣ **CURRENT CONFIGURATION**

### Environment Variables (`.env`)

```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production  # ⚠️ WEAK!
JWT_EXPIRE=24h
```

### ⚠️ **SECURITY ISSUE:**
The current JWT secret is a placeholder and easily guessable!

### ✅ **RECOMMENDED FIX:**

Use this newly generated strong secret:
```env
JWT_SECRET=5b0396e87ce06cc0f583bfb809531dd51c9b7f2e750d6c234d589b9c56fada621817bc86ad92d275c7dc1d4fa18b475865cd3ac5c36deda55b6581b58cb895da
JWT_EXPIRE=7d
```

---

## 9️⃣ **JWT VALIDATION ERRORS**

### Error Types:

1. **No Token Provided**
   ```json
   {
     "success": false,
     "message": "No token provided, authorization denied"
   }
   ```

2. **Invalid Token**
   ```json
   {
     "success": false,
     "message": "Invalid token"
   }
   ```

3. **Token Expired**
   ```json
   {
     "success": false,
     "message": "Token expired"
   }
   ```

4. **Admin Inactive**
   ```json
   {
     "success": false,
     "message": "Invalid token or admin account is inactive"
   }
   ```

---

## 🔟 **TESTING JWT WORKFLOW**

### 1. Generate Token (Register/Login)
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 2. Use Token in Protected Route
```bash
curl -X GET http://localhost:5000/api/kyc/statistics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Decode Token (for debugging)
```javascript
// Visit: https://jwt.io
// Paste your token to see decoded payload
```

---

## 📊 **JWT SECURITY BEST PRACTICES**

✅ **Currently Implemented:**
- Token stored in Authorization header (not cookies)
- Token includes minimal payload (id, email, role)
- Token has expiration time
- Password hashing with bcrypt
- Token verification on protected routes

❌ **Missing (Needs Implementation):**
- Strong JWT secret (using placeholder)
- Token refresh mechanism
- Token blacklist for logout
- HTTPS enforcement
- Rate limiting on auth endpoints
- Account lockout after failed attempts

---

## 🎯 **SUMMARY**

**JWT Generation Points:**
1. Admin Registration → `adminController.register()`
2. Admin Login → `adminController.login()`

**JWT Validation Points:**
- Every protected route via `auth` middleware
- All admin dashboard operations
- All KYC management operations
- PDF generation operations

**JWT Payload:**
```json
{
  "id": "MongoDB ObjectId",
  "email": "admin email",
  "role": "admin or super_admin",
  "iat": "issued at timestamp",
  "exp": "expiration timestamp"
}
```

**Token Lifetime:** 7 days (configurable via JWT_EXPIRE)

**Token Storage:** Frontend localStorage

**Token Transmission:** Authorization: Bearer {token}

---

## 🔧 **RECOMMENDED NEXT STEPS**

1. Update JWT_SECRET to strong random value
2. Implement token refresh mechanism
3. Add token blacklist for secure logout
4. Add rate limiting on auth endpoints
5. Implement RBAC middleware for super_admin routes
6. Add audit logging for all auth events

