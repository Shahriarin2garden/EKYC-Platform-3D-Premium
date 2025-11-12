# AI Service Setup Guide 🤖

This guide explains how to set up and use the AI-powered KYC summary generation feature using OpenRouter.

## 🌟 Features

- **Intelligent Summaries**: AI-generated professional summaries for KYC applications
- **Open-Source Models**: Uses free, open-source LLM models (Llama 3.1, Mistral, Gemma)
- **Automatic Fallback**: Falls back to rule-based summaries if AI is unavailable
- **Batch Processing**: Regenerate summaries for multiple applications at once
- **Zero Cost Testing**: Free tier models available for development and testing

## 🚀 Quick Start

### 1. Get OpenRouter API Key (Free!)

1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Sign up for a free account
3. Generate an API key
4. No credit card required for free models!

### 2. Configure Environment Variables

Add these to your `backend/.env` file:

```env
# OpenRouter AI Configuration
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
APP_URL=http://localhost:3000
```

### 3. Restart Backend Server

```bash
cd backend
npm start
```

## 🤖 Available Models

### Free Open-Source Models (Recommended)

1. **Llama 3.1 8B Instruct** (Default - Best Balance) ⭐
   - Model: `meta-llama/llama-3.1-8b-instruct:free`
   - Speed: Fast
   - Quality: Excellent
   - Best for: Professional summaries
   - Context: 128K tokens

2. **Mistral 7B Instruct**
   - Model: `mistralai/mistral-7b-instruct:free`
   - Speed: Very Fast
   - Quality: Very Good
   - Best for: Quick processing
   - Context: 32K tokens

3. **Google Gemma 2 9B**
   - Model: `google/gemma-2-9b-it:free`
   - Speed: Fast
   - Quality: Excellent
   - Best for: Detailed analysis
   - Context: 8K tokens

4. **Llama 3.2 3B Instruct**
   - Model: `meta-llama/llama-3.2-3b-instruct:free`
   - Speed: Very Fast
   - Quality: Good
   - Best for: High-volume processing
   - Context: 128K tokens

5. **Qwen 2.5 7B Instruct** (New!)
   - Model: `qwen/qwen-2.5-7b-instruct:free`
   - Speed: Fast
   - Quality: Very Good
   - Best for: Balanced performance
   - Context: 32K tokens

### Change Model

In `.env`, update:
```env
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

### Using OpenRouter SDK

The service now uses the official `@openrouter/sdk` for better reliability:

```javascript
const { OpenRouter } = require('@openrouter/sdk');

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL,
    'X-Title': 'EKYC System',
  },
});

const completion = await openRouter.chat.send({
  model: 'meta-llama/llama-3.1-8b-instruct:free',
  messages: [...],
  stream: false,
});
```

## 📡 API Endpoints

### 1. Submit KYC (Automatic AI Summary)

```bash
POST /api/kyc/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "nid": "1234567890",
  "occupation": "Software Engineer",
  "address": "123 Main St, City"
}
```

**Response includes AI summary in `summary` field**

### 2. Regenerate AI Summary (Single)

```bash
POST /api/kyc/:id/regenerate-summary
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "AI summary regenerated successfully",
  "data": {
    "aiSummary": "📋 KYC Application Summary..."
  }
}
```

### 3. Batch Regenerate Summaries

```bash
POST /api/kyc/batch-regenerate-summaries?status=pending
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected, under_review)

**Response:**
```json
{
  "success": true,
  "message": "AI summaries regenerated: 10 succeeded, 0 failed",
  "data": {
    "total": 10,
    "succeeded": 10,
    "failed": 0
  }
}
```

## 💡 How It Works

### With AI (When API Key is Configured)

1. User submits KYC application
2. System sends data to OpenRouter API
3. Open-source LLM analyzes the data
4. AI generates professional summary with:
   - Applicant overview
   - Verification status
   - Risk assessment
   - Recommendations
5. Summary saved to database

### Without AI (Fallback Mode)

1. System detects missing API key
2. Uses rule-based algorithm to generate summary
3. Includes:
   - Profile completeness percentage
   - Field status (provided/missing)
   - Risk level calculation
   - Standard recommendations

## 🎨 Summary Format

### AI-Generated Summary Example

```
📋 KYC Application Overview

The applicant, John Doe (john@example.com), has submitted a comprehensive 
KYC application for verification. The provided information indicates a 
software engineer with complete documentation.

✅ Verification Status: COMPLETE
All required fields have been provided including National ID (1234567890), 
occupation details, and residential address. The application is ready for 
document verification phase.

⚡ Initial Risk Assessment: LOW
No immediate red flags identified. Standard verification procedures are 
recommended. The completeness of the application suggests good cooperation.

📌 Recommended Next Steps:
1. Verify National ID document authenticity
2. Cross-reference address with utility bills
3. Conduct employment verification if required
4. Proceed with standard AML/KYC screening
5. Schedule video verification if applicable
```

### Rule-Based Summary Example

```
📋 KYC Application Summary

👤 Applicant: John Doe (john@example.com)

📊 Profile Completeness: 100% (5/5 fields)

🆔 National ID: 1234567890
💼 Occupation: Software Engineer
📍 Address: 123 Main St, City

⚡ Initial Risk Level: LOW ✅
All required information provided. Standard verification process recommended.

📌 Next Steps:
- Proceed with document verification
- Verify identity documents
- Conduct background screening
- Review for compliance with AML/KYC policies

Submitted: November 12, 2025 at 10:30 AM
```

## 🔧 Troubleshooting

### "AI summary generation failed"

**Cause**: API key issues or rate limiting

**Solution**:
1. Check API key is correct in `.env`
2. Verify API key has credits (check OpenRouter dashboard)
3. System will automatically use fallback summary
4. Check backend logs for detailed error

### "Fallback to basic summary"

**Cause**: Normal behavior when AI is unavailable

**Solution**:
- This is expected - basic summaries still work
- To use AI, add valid `OPENROUTER_API_KEY` to `.env`
- No action needed if basic summaries are acceptable

### Rate Limiting

**Free tier limits:**
- Varies by model
- Llama 3.1 8B: ~20 requests/minute
- Mistral 7B: ~30 requests/minute

**Solution**:
- System includes automatic rate limiting (500ms delay)
- For high volume, consider paid tier or multiple API keys

## 📊 Monitoring

### Check AI Service Status

Backend logs will show:
```
🤖 Generating AI summary for KYC application...
✅ AI summary generated successfully using: meta-llama/llama-3.1-8b-instruct:free
```

Or fallback:
```
⚠️  OpenRouter API key not configured. Using basic summary.
```

### View Summary in Admin Dashboard

1. Login to admin dashboard
2. Click "View Details" (👁️ icon) on any application
3. Scroll to "AI Summary" section
4. Click "Regenerate Summary" button to get new AI analysis

## 🎯 Best Practices

1. **Use AI for Important Applications**: High-value or complex cases
2. **Batch Process**: Use batch endpoint for multiple applications
3. **Monitor Costs**: Free tier is generous but has limits
4. **Fallback is Fine**: Basic summaries work well for standard cases
5. **Test Models**: Try different models to find best fit for your needs

## 🆓 Cost Information

### Free Tier
- **Llama 3.1 8B**: Completely free
- **Mistral 7B**: Completely free
- **Gemma 2 9B**: Completely free
- No credit card required
- Perfect for development and moderate production use

### Paid Tier (Optional)
- Only needed for very high volume
- More powerful models available
- Pay per token (very affordable)
- See [OpenRouter Pricing](https://openrouter.ai/docs/pricing)

## 🔐 Security

- API key stored in `.env` (not committed to git)
- Requests sent over HTTPS
- No sensitive data stored by OpenRouter
- Model runs on OpenRouter servers (no local GPU needed)

## 📚 Additional Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Available Models List](https://openrouter.ai/models)
- [API Usage Dashboard](https://openrouter.ai/activity)

## 🤝 Support

For issues or questions:
1. Check backend logs for detailed errors
2. Verify API key configuration
3. Test with basic summary first
4. Contact OpenRouter support for API issues

---

**Made with ❤️ for EKYC System**
