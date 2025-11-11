# ==========================================
# QUICK START: Get MongoDB Running NOW!
# ==========================================

## FASTEST OPTION: Use MongoDB Atlas (2 minutes setup)

### Step 1: Sign Up (30 seconds)
1. Open: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Choose "Free Shared" cluster

### Step 2: Create Cluster (1 minute - automated)
1. Select any cloud provider (AWS recommended)
2. Select any region close to you
3. Click "Create Cluster" (wait 1-3 minutes)

### Step 3: Setup Access (30 seconds)
1. Click "Database Access" → "Add New Database User"
   - Username: `ekyc_admin`
   - Password: Click "Autogenerate" or use: `EkycPass2025!`
   - User Privileges: "Read and write to any database"
   - Click "Add User"

2. Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"

### Step 4: Get Connection String (30 seconds)
1. Click "Database" → "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password

Example:
```
mongodb+srv://ekyc_admin:EkycPass2025!@cluster0.xxxxx.mongodb.net/ekyc_db?retryWrites=true&w=majority
```

### Step 5: Update .env File
Open `backend/.env` and update:
```env
MONGODB_URI=mongodb+srv://ekyc_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ekyc_db?retryWrites=true&w=majority
```

### Step 6: Start Server
```powershell
cd backend
node src/server.js
```

---

## ALTERNATIVE: Install MongoDB Locally

### Option A: Using Chocolatey (Easiest for Windows)
```powershell
# 1. Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. Install MongoDB
choco install mongodb -y

# 3. Start MongoDB
net start MongoDB

# 4. Your .env should have:
# MONGODB_URI=mongodb://localhost:27017/ekyc_db
```

### Option B: Manual Installation
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer, choose "Complete"
3. Select "Install MongoDB as a Service"
4. After installation: `net start MongoDB`

---

## TEST YOUR CONNECTION

Once MongoDB is connected, test with:

```powershell
# 1. Test health endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# 2. Submit a KYC form
$body = @{
    name = "John Doe"
    email = "john.doe@example.com"
    address = "123 Main Street, New York"
    nid = "NID-123456"
    occupation = "Software Engineer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/submit" -Method Post -ContentType "application/json" -Body $body

# 3. Register an admin
$adminBody = @{
    name = "Admin User"
    email = "admin@example.com"
    password = "Admin123456!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/register" -Method Post -ContentType "application/json" -Body $adminBody

# 4. Login as admin
$loginBody = @{
    email = "admin@example.com"
    password = "Admin123456!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $response.data.token
Write-Host "Your token: $token"

# 5. Get all KYC submissions (requires admin token)
$headers = @{
    Authorization = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/kyc" -Headers $headers
```

---

## WHAT WAS CREATED:

### 📁 Database Models:
- **Kyc Model** (`backend/src/models/Kyc.js`): Stores customer KYC data
- **Admin Model** (`backend/src/models/Admin.js`): Stores admin users with hashed passwords

### 🛣️ API Routes:
- `POST /api/kyc/submit` - Submit KYC form
- `GET /api/kyc` - Get all KYC (admin only)
- `GET /api/kyc/:id` - Get specific KYC (admin only)
- `PATCH /api/kyc/:id/status` - Update KYC status (admin only)
- `POST /api/admin/register` - Register new admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile (protected)

### 🔒 Features:
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Input validation
- ✅ MongoDB indexes for performance
- ✅ Error handling
- ✅ CORS configuration
- ✅ Status tracking (pending/approved/rejected)
- ✅ AI summary generation (template)

---

## TROUBLESHOOTING:

### Error: "Cannot connect to MongoDB"
- **Solution**: Use MongoDB Atlas (cloud) - it's free and takes 2 minutes to set up

### Error: "Port 5000 already in use"
- **Solution**: `taskkill /F /IM node.exe`

### Error: "Invalid token"
- **Solution**: Make sure to include `Authorization: Bearer YOUR_TOKEN` header

---

## NEXT STEPS:

1. ✅ MongoDB is connected
2. ✅ Data is being stored efficiently
3. 🎯 Start your frontend: `cd frontend && npm start`
4. 🎯 Test the full flow: Register → Login → Submit KYC → View submissions
5. 🎯 Optional: Add AI summary generation with OpenAI/Google AI

**Your backend is now fully integrated with MongoDB! 🎉**
