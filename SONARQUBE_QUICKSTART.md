# SonarQube - Quick Start Guide

## ✅ Status: SonarQube Server is Running

Your SonarQube server is running at: **<http://localhost:9000>**

## 📋 Next Steps to Complete Setup

### Step 1: Access SonarQube Web UI

1. Open your browser and go to: **<http://localhost:9000>**
2. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin`

### Step 2: Change Default Password

On first login, SonarQube will ask you to change the admin password:

1. Enter a new password (remember it!)
2. Confirm the password
3. Click "Update"

### Step 3: Generate Authentication Token

1. Click on your **profile icon** (top right)
2. Select **My Account** → **Security** tab
3. Click **Generate Token**
   - Name: `ekyc-platform`
   - Type: `User Token`
   - Expiration: `No expiration` or `90 days`
4. Click **Generate**
5. **Copy the token** (you won't see it again!)

### Step 4: Update Configuration

Open `C:\Users\HP\EKYC-Platform\sonar-scanner.js` and replace:

```javascript
login: 'admin',
password: 'admin',
```

With:

```javascript
token: 'YOUR_TOKEN_HERE',  // Paste your generated token
```

### Step 5: Run Analysis

```powershell
cd C:\Users\HP\EKYC-Platform
node sonar-scanner.js
```

## 🎯 What Will Be Analyzed

- ✅ **Backend**: Node.js/JavaScript code quality
- ✅ **Frontend**: React/TypeScript code quality
- ✅ **Security**: Vulnerability detection
- ✅ **Code Smells**: Best practice violations
- ✅ **Bugs**: Potential runtime errors
- ✅ **Coverage**: Code test coverage (if tests exist)
- ✅ **Duplications**: Duplicate code detection

## 📊 After Analysis

Once analysis completes, you'll see:

1. **Quality Gate Status**: Pass/Fail
2. **Bugs**: Critical issues to fix
3. **Vulnerabilities**: Security concerns
4. **Code Smells**: Maintainability issues
5. **Coverage**: % of code tested
6. **Duplications**: Repeated code blocks
7. **Size**: Lines of code metrics

## 🔧 Useful Commands

```powershell
# Check SonarQube status
docker ps | findstr sonarqube

# View SonarQube logs
docker logs sonarqube --tail 50

# Stop SonarQube
docker stop sonarqube

# Start SonarQube (if stopped)
docker start sonarqube

# Remove SonarQube container
docker rm -f sonarqube
```

## 🐛 Troubleshooting

### "401 Unauthorized" Error

- **Solution**: Complete Steps 2-4 above to create and use a token

### Analysis Fails to Start

- Check if SonarQube is running: `docker ps`
- Check if port 9000 is accessible: Open <http://localhost:9000>
- View logs: `docker logs sonarqube`

### Slow Analysis

- First analysis takes longer (2-5 minutes)
- Subsequent analyses are faster (~30-60 seconds)

### Out of Memory

- Add to docker run command: `-e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true`
- Increase Docker memory limit in Docker Desktop settings

## 📚 Understanding Results

### Quality Gate

- **Passed**: Code meets minimum quality standards
- **Failed**: Issues need attention before deployment

### Priority Levels

1. **Blocker**: Must fix immediately
2. **Critical**: Fix before release
3. **Major**: Should fix soon
4. **Minor**: Nice to improve
5. **Info**: Informational only

### Code Smell Examples

- Long methods (>50 lines)
- Unused variables
- Duplicate code blocks
- Complex conditional logic
- Missing error handling

## 🚀 Integration Tips

### CI/CD Integration

Add to your pipeline:

```yaml
- name: SonarQube Scan
  run: node sonar-scanner.js
```

### Pre-commit Hook

Add quality checks before commits

### IDE Integration

Install SonarLint extension in VS Code for real-time analysis

## 📚 Resources

- SonarQube Docs: <https://docs.sonarsource.com/sonarqube/latest/>
- Rules Reference: <http://localhost:9000/coding_rules>
- Quality Profiles: <http://localhost:9000/profiles>
- Project Dashboard: <http://localhost:9000/dashboard?id=ekyc-platform>

---

## Summary

**Current Status**: ✅ SonarQube server running
**Next Action**: Complete Steps 1-5 above to run first analysis
**Time Required**: 5-10 minutes for setup + 2-5 minutes for analysis

Once configured, future analyses run with just: `node sonar-scanner.js`
