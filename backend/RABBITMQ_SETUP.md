# RabbitMQ Setup Guide for PDF Generation

## Quick Setup Options

### Option 1: CloudAMQP (Recommended - No Installation Required)

**Free cloud-hosted RabbitMQ service:**

1. Go to https://www.cloudamqp.com
2. Click "Sign Up" (free account)
3. Create a new instance:
   - Plan: "Little Lemur" (Free)
   - Name: "ekyc-pdf-queue"
   - Region: Choose nearest
   - Click "Select Region"
4. Copy the AMQP URL from dashboard
5. Paste it in `backend/.env`:
   ```
   RABBITMQ_URL=amqps://your-cloudamqp-url
   ```
6. Restart the backend server

**Benefits:**
- ✅ No installation required
- ✅ Works immediately
- ✅ Free tier available
- ✅ Managed service

### Option 2: Local Installation (Requires Admin Rights)

#### Using Chocolatey (Windows)

1. Open PowerShell as Administrator
2. Run:
   ```powershell
   choco install rabbitmq -y
   ```
3. Start RabbitMQ service:
   ```powershell
   Start-Service RabbitMQ
   ```
4. Enable management plugin:
   ```powershell
   rabbitmq-plugins enable rabbitmq_management
   ```
5. Update `.env`:
   ```
   RABBITMQ_URL=amqp://localhost:5672
   ```

#### Using Docker (If Docker is installed)

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

Then update `.env`:
```
RABBITMQ_URL=amqp://localhost:5672
```

## Verification

After setting up RabbitMQ, verify it's working:

1. **Restart Backend Server:**
   ```bash
   cd backend
   npm start
   ```

2. **Look for success messages:**
   ```
   Starting PDF Worker...
   Connecting to RabbitMQ...
   Queue "pdf_generation_queue" ready
   PDF Worker started successfully
   ```

3. **Test PDF Generation:**
   ```bash
   cd backend
   node src/services/testRabbitMQPdf.js
   ```

## Management UI

- **CloudAMQP**: Dashboard available in your CloudAMQP account
- **Local RabbitMQ**: http://localhost:15672 (guest/guest)

## Troubleshooting

### Backend shows "PDF Worker: Disabled"

**Cause:** RABBITMQ_URL not configured or RabbitMQ not accessible

**Solution:**
1. Check `.env` file has RABBITMQ_URL
2. Verify RabbitMQ is running
3. Test connection manually

### Connection refused errors

**Cause:** RabbitMQ server not running

**Solution:**
- For local: Start RabbitMQ service
- For CloudAMQP: Check URL is correct

### PDF generation still works

**Note:** The system has a fallback! If RabbitMQ is unavailable, PDFs are generated synchronously. This means:
- ✅ PDFs will still generate
- ⚠️ API requests will wait for PDF to complete
- ⚠️ No queue-based processing

## Testing Without RabbitMQ

You can test PDF generation without RabbitMQ:

```bash
cd backend
node src/services/testPdfGeneration.js
```

This tests direct PDF generation (synchronous mode).

## How It Works

### With RabbitMQ (Async):
1. Admin requests PDF → Instant response
2. Request queued in RabbitMQ
3. PDF Worker processes queue
4. PDF generated in background
5. Admin downloads when ready

### Without RabbitMQ (Sync):
1. Admin requests PDF → Wait
2. PDF generated immediately
3. Response when complete
4. Admin downloads immediately

Both modes work perfectly! RabbitMQ just improves the user experience for large PDFs or high volume.
