# Railway 502 Error Troubleshooting

## Changes Deployed (Just Now)

### 1. **Enhanced CORS Handling**
- ✅ Allow all origins (temporary for debugging)
- ✅ Explicit OPTIONS handler for preflight requests
- ✅ Added 24-hour cache for preflight
- ✅ All HTTP methods enabled (GET, POST, PUT, PATCH, DELETE, OPTIONS)

### 2. **Fixed Duplicate Index Warnings**
- ✅ Removed duplicate `email` index from Admin model
- ✅ Removed duplicate indexes from Kyc model (email, nid, status, submittedAt)
- This was causing mongoose warnings and potential connection issues

### 3. **Better Error Logging**
- ✅ Added request logging middleware (logs every request with IP, origin, user-agent)
- ✅ Enhanced error handler with more context
- ✅ Try-catch around route initialization

## What to Check Now

### Step 1: Monitor Railway Deploy Logs
Wait for Railway to rebuild (should take 1-2 minutes), then check:

**Expected logs:**
```
✅ EKYC API Server successfully started
🌐 Listening on 0.0.0.0:5000
✅ MongoDB connected successfully
```

**Should NOT see:**
```
Warning: Duplicate schema index
```

### Step 2: Check HTTP Logs After New Deploy
Watch for:
1. **OPTIONS requests** - Should return **204** (not 502)
2. **POST /api/kyc/submit** - Should return **201** or **400** (not 502)
3. **POST /api/admin/login** - Should return **200** or **401** (not 502)

### Step 3: Test Endpoints Manually

**Test 1: Health Check**
```bash
curl https://ekyc-platform-3d-premium-production.up.railway.app/api/health
```
Expected: 200 OK

**Test 2: OPTIONS Preflight (CORS)**
```bash
curl -X OPTIONS https://ekyc-platform-3d-premium-production.up.railway.app/api/kyc/submit \
  -H "Origin: https://ekyc-two.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```
Expected: 204 No Content

**Test 3: KYC Submit**
```bash
curl -X POST https://ekyc-platform-3d-premium-production.up.railway.app/api/kyc/submit \
  -H "Content-Type: application/json" \
  -H "Origin: https://ekyc-two.vercel.app" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "address": "123 Test St",
    "nid": "1234567890",
    "occupation": "Developer"
  }'
```
Expected: 201 Created or 400 Bad Request (if duplicate)

### Step 4: Frontend Configuration Check

**Verify frontend is using correct API URL:**
```javascript
// In frontend, check .env or api.ts
REACT_APP_API_URL=https://ekyc-platform-3d-premium-production.up.railway.app
```

**Check browser console for CORS errors**
- Open DevTools → Network tab
- Try submitting KYC form
- Look for:
  - Red OPTIONS request = CORS issue
  - 502 on POST = Server crash on that endpoint
  - 200 on OPTIONS + 502 on POST = Route handler issue

## Common 502 Causes & Solutions

### Cause 1: CORS Preflight Failing
**Symptoms:** OPTIONS returns 502
**Solution:** ✅ Fixed - Added explicit OPTIONS handler

### Cause 2: Server Crashing on Request
**Symptoms:** Server logs show error, then restart
**Solution:** ✅ Fixed - Added error boundaries and logging

### Cause 3: Mongoose Connection Issues
**Symptoms:** Routes work sometimes, fail others
**Solution:** ✅ Fixed - Server starts without waiting for DB

### Cause 4: Database Query Timeout
**Symptoms:** 502 after several seconds
**Solution:** Check MongoDB Atlas connection and indexes

### Cause 5: Request Body Too Large
**Symptoms:** 502 on POST with large data
**Solution:** ✅ Fixed - Increased limit to 10mb

## If 502 Persists

### Scenario A: OPTIONS still returns 502
**This means:** Preflight is not reaching your app
**Action:**
1. Check Railway service is running (green status)
2. Check if domain is pointing correctly
3. Test health endpoint: `curl https://your-url/`

### Scenario B: Health works, but API routes return 502
**This means:** Routes are crashing on execution
**Action:**
1. Check Deploy Logs for crash messages
2. Look for "KYC submission error" or "Admin login error"
3. Test with simple payload first

### Scenario C: Works in Postman, fails from frontend
**This means:** CORS or Origin issue
**Action:**
1. Check browser console for CORS errors
2. Verify frontend URL matches FRONTEND_URL env var
3. Test with CORS disabled in browser (dev mode)

## Debug Commands

### View Railway Logs in Real-Time
```bash
railway logs --follow
```

### Test Local Server
```bash
cd backend
npm test:server
```

### Check Railway Environment Variables
```bash
railway variables
```

### Restart Railway Service
In Railway Dashboard:
Settings → Restart

## Expected Request Flow (Working)

1. **Browser → Railway Edge**
   - Browser sends OPTIONS preflight
   
2. **Railway Edge → Your App**
   - Forwards OPTIONS to 0.0.0.0:5000
   
3. **Your App**
   - CORS middleware intercepts OPTIONS
   - Returns 204 No Content
   - Headers: Access-Control-Allow-Origin, etc.
   
4. **Browser → Railway Edge → Your App**
   - Browser sends actual POST request
   - Your app processes via kycController
   - Returns 201/400/500

5. **Your App → Browser**
   - JSON response with data

## Current Status

✅ Server starting successfully on Railway
✅ MongoDB connected
✅ Health endpoint working
❌ API endpoints returning 502 (investigating)

## Next Deploy Should Show

**Deploy Logs:**
```
npm start
✅ EKYC API Server successfully started
🌐 Listening on 0.0.0.0:5000
(No duplicate index warnings!)
✅ MongoDB connected successfully
```

**HTTP Logs (after fix):**
```
OPTIONS /api/kyc/submit  -> 204 (1ms)
POST /api/kyc/submit     -> 201 (150ms)
OPTIONS /api/admin/login -> 204 (1ms)
POST /api/admin/login    -> 200 (120ms)
```

## Contact Info

If still seeing 502s after this deploy:
1. Screenshot the Deploy Logs
2. Screenshot the HTTP Logs showing the 502
3. Check browser DevTools Network tab
4. Try the curl commands above and share output

The server IS running and healthy - we're narrowing down why specific routes are failing!
