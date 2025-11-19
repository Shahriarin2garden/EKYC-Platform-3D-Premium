# Testing Guide

This document describes the comprehensive unit testing setup for the EKYC Platform.

## Overview

The project includes complete unit test coverage for both backend and frontend components:

- **Backend Tests**: Models, Controllers, Services, Middleware
- **Frontend Tests**: Components, Pages, Services (API)

## Test Structure

### Backend Tests (`/backend/__tests__`)

```
backend/__tests__/
├── models/
│   ├── Admin.test.js       # Admin model tests
│   └── Kyc.test.js         # KYC model tests
├── middleware/
│   └── auth.test.js        # Authentication middleware tests
├── controllers/
│   ├── adminController.test.js  # Admin controller tests
│   └── kycController.test.js    # KYC controller tests
└── services/
    ├── aiService.test.js   # AI service tests
    └── pdfService.test.js  # PDF generation service tests
```

### Frontend Tests (`/frontend/src/__tests__`)

```
frontend/src/__tests__/
├── components/
│   ├── common/
│   │   └── FormStatus.test.tsx     # FormStatus component tests
│   └── form/
│       └── InputField.test.tsx     # InputField component tests
├── pages/
│   ├── AdminDashboard.test.tsx     # Admin dashboard tests
│   ├── AdminLogin.test.tsx         # Admin login tests
│   └── KycForm.test.tsx            # KYC form tests
└── services/
    └── api.test.ts                 # API service tests
```

## Running Tests

### Run All Tests

```bash
# From project root
npm run test:all
```

### Backend Tests Only

```bash
# From project root
npm run test:backend

# Or from backend directory
cd backend
npm test
```

### Frontend Tests Only

```bash
# From project root
npm run test:frontend

# Or from frontend directory
cd frontend
npm test
```

### Watch Mode (Development)

```bash
# Backend watch mode
npm run test:backend:watch

# Frontend watch mode
npm run test:frontend:watch
```

### Coverage Reports

```bash
# Full coverage report
npm run test:coverage

# Backend coverage only
npm run test:backend:coverage

# Frontend coverage only
npm run test:frontend:coverage
```

## Testing Technologies

### Backend

- **Jest**: Testing framework
- **Supertest**: HTTP assertions for API testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated tests

### Frontend

- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **jest-dom**: Custom DOM matchers

## Test Coverage

### Backend Coverage

- ✅ **Models** (Admin, Kyc)
  - Schema validation
  - Instance methods
  - Static methods
  - Pre-save hooks
  - Password hashing and comparison

- ✅ **Controllers** (Admin, KYC)
  - Registration and authentication
  - CRUD operations
  - Error handling
  - Validation

- ✅ **Middleware**
  - JWT authentication
  - Token validation
  - Error responses

- ✅ **Services**
  - AI summary generation
  - PDF generation
  - File operations

### Frontend Coverage

- ✅ **Components**
  - Form inputs and validation
  - Status messages
  - User interactions
  - Styling and states

- ✅ **Pages**
  - KYC form submission
  - Admin login flow
  - Dashboard functionality
  - Data fetching and display

- ✅ **Services**
  - API client configuration
  - Request/response handling
  - Authentication flow

## Writing New Tests

### Backend Test Example

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const Model = require('../../src/models/Model');

describe('Model Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('should create valid model', async () => {
    const data = { /* test data */ };
    const model = await Model.create(data);
    expect(model).toBeDefined();
  });
});
```

### Frontend Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from '../Component';

describe('Component Tests', () => {
  test('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('should handle user interaction', () => {
    render(<Component />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(/* assertion */).toBe(true);
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up after tests (database, mocks, etc.)
3. **Descriptive Names**: Use clear, descriptive test names
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mock External Dependencies**: Use mocks for APIs, databases, etc.
6. **Edge Cases**: Test both happy paths and error scenarios
7. **Coverage**: Aim for high coverage but focus on meaningful tests

## Continuous Integration

Tests should be run in CI/CD pipelines before deployment:

```yaml
# Example CI configuration
test:
  script:
    - npm run install:all
    - npm run test:all
    - npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **MongoDB Memory Server Timeout**
   - Increase timeout in jest.setup.js
   - Check system resources

2. **React Testing Library Warnings**
   - Ensure proper cleanup with `cleanup()`
   - Wrap async operations in `waitFor()`

3. **Mock Issues**
   - Clear mocks between tests with `jest.clearAllMocks()`
   - Verify mock paths are correct

### Debug Mode

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation if needed
