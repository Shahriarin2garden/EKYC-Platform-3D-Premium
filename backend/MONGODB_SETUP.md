# MongoDB Setup Guide for EKYC Project

## Option 1: MongoDB Atlas (Cloud - Recommended for Quick Start)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a free cluster (M0 Sandbox)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It will look like: `mongodb+srv://username:<password>@cluster.mongodb.net/ekyc_db?retryWrites=true&w=majority`

### Step 3: Update .env File
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/ekyc_db?retryWrites=true&w=majority
```
Replace `your_username` and `your_password` with your actual credentials.

### Step 4: Whitelist Your IP
1. In Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development

---

## Option 2: Local MongoDB Installation

### For Windows:

1. **Download MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server
   - Run the installer

2. **Install MongoDB**
   - Choose "Complete" installation
   - Install MongoDB as a Service
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```powershell
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

5. **Your .env file should have:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ekyc_db
   ```

---

## Quick Test: Using MongoDB Atlas Right Now

1. **Update your .env file** with this temporary connection:
   ```env
   MONGODB_URI=mongodb+srv://test:test123@cluster0.mongodb.net/ekyc_db?retryWrites=true&w=majority
   ```

2. **Restart your server:**
   ```bash
   cd backend
   node src/server.js
   ```

---

## Testing the Connection

Once MongoDB is connected, test the API:

```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Test KYC submission
Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/submit" -Method Post -ContentType "application/json" -Body '{"name":"John Doe","email":"john@example.com","address":"123 Main St","nid":"NID-12345","occupation":"Engineer"}'

# Test admin registration
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/register" -Method Post -ContentType "application/json" -Body '{"name":"Admin User","email":"admin@example.com","password":"admin12345"}'

# Test admin login
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@example.com","password":"admin12345"}'
```

---

## Database Structure

### Collections Created:
1. **kycs** - Stores customer KYC applications
2. **admins** - Stores admin users

### Sample KYC Document:
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "nid": "NID-12345",
  "occupation": "Engineer",
  "status": "pending",
  "aiSummary": "Generated summary...",
  "submittedAt": "2025-11-11T10:00:00.000Z",
  "createdAt": "2025-11-11T10:00:00.000Z",
  "updatedAt": "2025-11-11T10:00:00.000Z"
}
```
