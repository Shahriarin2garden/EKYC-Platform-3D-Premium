# 🐳 EKYC Platform - Docker Setup Guide

Complete guide to running the EKYC platform using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Services](#services)
- [Development Mode](#development-mode)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker**: Version 20.10 or higher
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
  - [Install Docker Engine](https://docs.docker.com/engine/install/) (Linux)
- **Docker Compose**: Version 2.0 or higher (included with Docker Desktop)

Verify your installation:
```bash
docker --version
docker compose version
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Shahriarin2garden/EKYC-Platform.git
cd EKYC-Platform

# Create environment file
cp .env.example .env

# Edit .env file with your configuration (optional)
# For quick start, the default values work fine
```

### 2. Build and Start Services

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **RabbitMQ Management**: http://localhost:15672 (username: `admin`, password: `admin123`)
- **MongoDB**: localhost:27017

### 4. Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v
```

## 🏗️ Architecture

The EKYC platform consists of 4 main services:

```
┌─────────────────────────────────────────────────────────────┐
│                     EKYC Platform                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Frontend   │◄────►│   Backend    │                   │
│  │   (React)    │      │   (Node.js)  │                   │
│  │  Port: 3000  │      │  Port: 5000  │                   │
│  └──────────────┘      └───────┬──────┘                   │
│                                 │                           │
│                        ┌────────▼────────┐                 │
│                        │    MongoDB      │                 │
│                        │  Port: 27017    │                 │
│                        └─────────────────┘                 │
│                                 │                           │
│                        ┌────────▼────────┐                 │
│                        │   RabbitMQ      │                 │
│                        │  Port: 5672     │                 │
│                        │  Mgmt: 15672    │                 │
│                        └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Configuration

### Environment Variables

Edit the `.env` file to customize your setup:

#### Essential Configuration

```env
# Application Environment
NODE_ENV=production

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3000

# JWT Secret (⚠️ CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# RabbitMQ Credentials
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin123
```

#### Optional Configuration

```env
# MongoDB Authentication (leave empty for no auth)
MONGODB_USER=
MONGODB_PASSWORD=

# AI Service (optional)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Security Recommendations

⚠️ **For Production:**

1. **Change JWT Secret**: Use a strong, random string
2. **Enable MongoDB Auth**: Set MONGODB_USER and MONGODB_PASSWORD
3. **Change RabbitMQ Credentials**: Update RABBITMQ_USER and RABBITMQ_PASSWORD
4. **Use HTTPS**: Configure SSL/TLS certificates
5. **Restrict Ports**: Only expose necessary ports

## 📦 Services

### Frontend (React + TypeScript)

- **Image**: Built from `frontend/Dockerfile`
- **Port**: 3000
- **Technology**: React 18, TypeScript, Tailwind CSS
- **Web Server**: Nginx (production)

### Backend (Node.js + Express)

- **Image**: Built from `backend/Dockerfile`
- **Port**: 5000
- **Technology**: Node.js 18, Express, Mongoose
- **Features**: 
  - REST API
  - JWT Authentication
  - PDF Generation
  - RabbitMQ Integration

### MongoDB

- **Image**: mongo:7.0
- **Port**: 27017
- **Database**: ekyc_db
- **Persistence**: Volume `mongodb_data`

### RabbitMQ

- **Image**: rabbitmq:3.12-management-alpine
- **AMQP Port**: 5672
- **Management UI**: 15672
- **Persistence**: Volume `rabbitmq_data`
- **Default Credentials**: admin / admin123

## 🛠️ Development Mode

For development with hot-reload and source code mounting:

### Create docker-compose.dev.yml

```yaml
version: '3.8'

services:
  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    ports:
      - "3000:3000"
    command: npm start
```

### Start in Development Mode

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 🚀 Production Deployment

### 1. Prepare for Production

```bash
# Update .env with production values
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
MONGODB_USER=ekyc_user
MONGODB_PASSWORD=<strong-password>
RABBITMQ_USER=ekyc_admin
RABBITMQ_PASSWORD=<strong-password>
```

### 2. Build Production Images

```bash
# Build all images
docker compose build --no-cache

# Tag images for registry (optional)
docker tag ekyc-frontend:latest your-registry.com/ekyc-frontend:latest
docker tag ekyc-backend:latest your-registry.com/ekyc-backend:latest
```

### 3. Deploy

```bash
# Start in detached mode
docker compose up -d

# Check logs
docker compose logs -f

# Monitor health
docker compose ps
```

### 4. Backup and Restore

#### Backup

```bash
# Backup MongoDB
docker compose exec mongodb mongodump --out=/data/backup

# Copy backup from container
docker cp ekyc-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)

# Backup RabbitMQ (definitions)
curl -u admin:admin123 http://localhost:15672/api/definitions -o rabbitmq-backup-$(date +%Y%m%d).json
```

#### Restore

```bash
# Restore MongoDB
docker compose exec mongodb mongorestore /data/backup

# Restore RabbitMQ
curl -u admin:admin123 -H "Content-Type: application/json" -X POST \
  --data @rabbitmq-backup.json http://localhost:15672/api/definitions
```

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs [service-name]

# Example: Check backend logs
docker compose logs backend

# Check container status
docker compose ps
```

### Database Connection Issues

```bash
# Verify MongoDB is running
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker compose logs mongodb
```

### Port Already in Use

```bash
# Change ports in .env file
BACKEND_PORT=5001
FRONTEND_PORT=3001
MONGODB_PORT=27018
```

### Clear Everything and Restart

```bash
# Stop all containers
docker compose down

# Remove all volumes (⚠️ deletes data)
docker compose down -v

# Remove all images
docker compose down --rmi all

# Rebuild and start
docker compose up --build -d
```

### Network Issues

```bash
# Recreate network
docker compose down
docker network rm ekyc-network
docker compose up -d
```

## 🔧 Useful Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Execute Commands in Container

```bash
# Access backend shell
docker compose exec backend sh

# Access MongoDB shell
docker compose exec mongodb mongosh

# Run npm commands in backend
docker compose exec backend npm run test
```

### Inspect Containers

```bash
# Container details
docker compose ps
docker inspect ekyc-backend

# Resource usage
docker stats

# Network inspection
docker network inspect ekyc-network
```

### Cleanup

```bash
# Remove stopped containers
docker compose rm

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup (⚠️ removes everything)
docker system prune -a --volumes
```

### Health Checks

```bash
# Check all services
curl http://localhost:5000/api/health
curl http://localhost:3000/health
curl http://localhost:15672/api/health

# Check from within network
docker compose exec backend wget -q -O- http://mongodb:27017
```

## 📝 Notes

### Data Persistence

All data is persisted in Docker volumes:
- `mongodb_data`: MongoDB database files
- `mongodb_config`: MongoDB configuration
- `rabbitmq_data`: RabbitMQ messages and settings
- `backend_pdfs`: Generated PDF files

### Networking

All services are connected via the `ekyc-network` bridge network, allowing them to communicate using service names (e.g., `mongodb`, `rabbitmq`).

### Security

- Backend and Frontend use non-root users
- Health checks ensure service availability
- Environment variables for sensitive configuration
- Nginx security headers in frontend

### Performance

- Multi-stage builds reduce image size
- Node modules cached in separate layers
- Gzip compression enabled in Nginx
- Static asset caching configured

## 🆘 Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review service logs: `docker compose logs [service]`
3. Create an issue on GitHub
4. Check Docker documentation: https://docs.docker.com/

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB in Docker](https://hub.docker.com/_/mongo)
- [RabbitMQ in Docker](https://hub.docker.com/_/rabbitmq)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Happy Dockerizing! 🐳**
