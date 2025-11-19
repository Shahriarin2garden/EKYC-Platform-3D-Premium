# Running Tests - Step by Step Guide

This guide walks you through running each test individually to verify the testing setup.

## Prerequisites

Ensure you have the project cloned locally and dependencies installed:

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd EKYC-Platform

# Install all dependencies
npm run install:all
```

## Running Tests One by One

### Backend Tests

#### 1. Admin Model Tests
```bash
cd backend
npm test -- __tests__/models/Admin.test.js
```
**Expected Output**: 15+ tests passing
- Admin creation and validation
- Password hashing
- JWT token generation
- Credential verification

#### 2. KYC Model Tests
```bash
npm test -- __tests__/models/Kyc.test.js
```
**Expected Output**: 18+ tests passing
- KYC application creation
- Status management
- Statistics calculation
- PDF tracking

#### 3. Auth Middleware Tests
```bash
npm test -- __tests__/middleware/auth.test.js
```
**Expected Output**: 10+ tests passing
- Token validation
- Admin verification
- Error handling

#### 4. AI Service Tests
```bash
npm test -- __tests__/services/aiService.test.js
```
**Expected Output**: 12+ tests passing
- Summary generation
- Completeness calculation
- Risk assessment

#### 5. PDF Service Tests
```bash
npm test -- __tests__/services/pdfService.test.js
```
**Expected Output**: 10+ tests passing
- PDF generation
- File operations
- Error handling

#### 6. Admin Controller Tests
```bash
npm test -- __tests__/controllers/adminController.test.js
```
**Expected Output**: 12+ tests passing
- Registration and login
- Profile management
- Password changes

#### 7. KYC Controller Tests
```bash
npm test -- __tests__/controllers/kycController.test.js
```
**Expected Output**: 15+ tests passing
- KYC submission
- Data retrieval
- Status updates

### Frontend Tests

#### 1. FormStatus Component Tests
```bash
cd ../frontend
npm test -- src/__tests__/components/common/FormStatus.test.tsx
```
**Expected Output**: 8 tests passing
- Message rendering
- Success/error states
- AI summary display

#### 2. InputField Component Tests
```bash
npm test -- src/__tests__/components/form/InputField.test.tsx
```
**Expected Output**: 15+ tests passing
- Input rendering
- Validation
- User interactions

#### 3. API Service Tests
```bash
npm test -- src/__tests__/services/api.test.ts
```
**Expected Output**: 8+ tests passing
- API configuration
- Request/response handling
- Authentication

#### 4. KYC Form Tests
```bash
npm test -- src/__tests__/pages/KycForm.test.tsx
```
**Expected Output**: 12+ tests passing
- Form submission
- Field validation
- Loading states

#### 5. Admin Login Tests
```bash
npm test -- src/__tests__/pages/AdminLogin.test.tsx
```
**Expected Output**: 10+ tests passing
- Login flow
- Credential validation
- Error handling

#### 6. Admin Dashboard Tests
```bash
npm test -- src/__tests__/pages/AdminDashboard.test.tsx
```
**Expected Output**: 10+ tests passing
- Data fetching
- Application display
- PDF generation

## Running All Tests at Once

### Backend All Tests
```bash
cd backend
npm test
```

### Frontend All Tests
```bash
cd frontend
npm test -- --watchAll=false
```

### All Tests from Root
```bash
cd ..
npm run test:all
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Ensure dependencies are installed
```bash
npm run install:all
```

### Issue: MongoDB Memory Server timeout
**Solution**: Increase timeout in jest.setup.js or ensure sufficient system resources

### Issue: React Testing Library warnings
**Solution**: Tests use proper cleanup and waitFor() for async operations

### Issue: "Command not found: jest"
**Solution**: Install dependencies or use npx
```bash
npx jest
```

## Verbose Output

For detailed test output, use the `--verbose` flag:
```bash
npm test -- __tests__/models/Admin.test.js --verbose
```

## Coverage Report

Generate coverage for a specific test:
```bash
npm test -- __tests__/models/Admin.test.js --coverage
```

## Watch Mode

Run tests in watch mode for development:
```bash
npm test -- --watch
```

## Expected Results Summary

| Test Suite | Location | Tests | Status |
|------------|----------|-------|--------|
| Admin Model | backend/__tests__/models | 15+ | ✅ Ready |
| KYC Model | backend/__tests__/models | 18+ | ✅ Ready |
| Auth Middleware | backend/__tests__/middleware | 10+ | ✅ Ready |
| AI Service | backend/__tests__/services | 12+ | ✅ Ready |
| PDF Service | backend/__tests__/services | 10+ | ✅ Ready |
| Admin Controller | backend/__tests__/controllers | 12+ | ✅ Ready |
| KYC Controller | backend/__tests__/controllers | 15+ | ✅ Ready |
| FormStatus | frontend/src/__tests__/components | 8 | ✅ Ready |
| InputField | frontend/src/__tests__/components | 15+ | ✅ Ready |
| API Service | frontend/src/__tests__/services | 8+ | ✅ Ready |
| KYC Form | frontend/src/__tests__/pages | 12+ | ✅ Ready |
| Admin Login | frontend/src/__tests__/pages | 10+ | ✅ Ready |
| Admin Dashboard | frontend/src/__tests__/pages | 10+ | ✅ Ready |

**Total**: 155+ test cases across 13 test suites

## Quick Test Commands

For your convenience, here are the most common commands:

```bash
# Test everything
npm run test:all

# Test backend only
npm run test:backend

# Test frontend only
npm run test:frontend

# Coverage reports
npm run test:coverage

# Watch mode (development)
npm run test:backend:watch
npm run test:frontend:watch
```

## Next Steps

After running tests successfully:

1. ✅ Review test coverage reports
2. ✅ Add new tests for new features
3. ✅ Run tests before committing
4. ✅ Set up CI/CD pipeline to run tests automatically

## Notes

- All tests are designed to run independently
- Tests use in-memory databases (no external dependencies needed)
- Mock data is used for external API calls
- Tests clean up after themselves automatically
