# SonarQube Setup Guide for EKYC Platform

## Current Status
✅ SonarQube scanner installed
✅ Configuration file created (sonar-project.properties)
❌ SonarQube server not running

## Options to Run SonarQube Analysis

### Option 1: Use SonarCloud (Recommended - No Local Setup)
1. Go to https://sonarcloud.io/
2. Sign in with your GitHub account
3. Create a new organization or use existing
4. Add your project and get a token
5. Update `sonar-project.properties`:
   ```properties
   sonar.host.url=https://sonarcloud.io
   sonar.organization=your-org-key
   sonar.token=your-token-here
   ```
6. Run: `npm run sonar`

### Option 2: Run Local SonarQube Server with Docker
```powershell
# Pull and run SonarQube container
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Wait for startup (takes 2-3 minutes)
# Access at http://localhost:9000
# Default credentials: admin/admin
```

Then run analysis:
```powershell
npm run sonar
```

### Option 3: Download SonarQube Community Edition
1. Download from: https://www.sonarsource.com/products/sonarqube/downloads/
2. Extract and run:
   ```powershell
   cd sonarqube-x.x.x.xxxxx\bin\windows-x86-64
   .\StartSonar.bat
   ```
3. Access at http://localhost:9000
4. Run analysis: `npm run sonar`

### Option 4: Quick Static Analysis (No Server Required)
Install ESLint and run local code quality checks:
```powershell
# Backend
cd backend
npm install -D eslint
npx eslint src --ext .js

# Frontend  
cd frontend
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx eslint src --ext .ts,.tsx
```

## Current Configuration
- Project Key: ekyc-platform
- Project Name: EKYC Platform
- Source Folders: backend/src, frontend/src
- Exclusions: node_modules, build, dist, coverage, test files, pdfs

## Next Steps
Choose one of the options above based on your preference:
- **SonarCloud**: Best for GitHub integration, no local setup
- **Docker**: Quick local setup if you have Docker installed
- **Community Edition**: Full local control
- **ESLint**: Quick immediate analysis without server

Would you like me to help set up any of these options?
