# Quick Test Commands Reference

## Installation

```bash
# Install all dependencies (including test dependencies)
npm run install:all
```

## Running Tests

### All Tests
```bash
npm run test:all                  # Run all backend + frontend tests
```

### Backend Tests
```bash
npm run test:backend              # Run backend tests once
npm run test:backend:watch        # Run backend tests in watch mode
npm run test:backend:coverage     # Run with coverage report
```

### Frontend Tests
```bash
npm run test:frontend             # Run frontend tests once
npm run test:frontend:watch       # Run frontend tests in watch mode
npm run test:frontend:coverage    # Run with coverage report
```

### Coverage Reports
```bash
npm run test:coverage             # Generate coverage for both backend and frontend
```

## Test Files Location

### Backend: `/backend/__tests__/`
- Models: `models/*.test.js`
- Controllers: `controllers/*.test.js`
- Middleware: `middleware/*.test.js`
- Services: `services/*.test.js`

### Frontend: `/frontend/src/__tests__/`
- Components: `components/**/*.test.tsx`
- Pages: `pages/*.test.tsx`
- Services: `services/*.test.ts`

## Coverage Thresholds

Backend and frontend tests aim for:
- 80%+ statement coverage
- 75%+ branch coverage
- 80%+ function coverage
- 80%+ line coverage

## Quick Tips

- Use watch mode during development
- Run coverage before committing
- All tests must pass before pushing to main
- Add tests for new features immediately

## CI/CD Integration

Tests are automatically run in CI/CD pipelines:
```bash
npm run test:all && npm run test:coverage
```
