#!/bin/bash

# EKYC Platform - VPS Deployment Script
# This script automates the deployment process on a VPS server

set -e  # Exit on error

echo "========================================"
echo "   EKYC Platform - VPS Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "${CYAN}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Step 2: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo -e "${CYAN}Step 2: Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $SUDO_USER
    rm get-docker.sh
else
    echo -e "${GREEN}Docker is already installed${NC}"
fi

# Step 3: Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${CYAN}Step 3: Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

# Step 4: Setup firewall
echo -e "${CYAN}Step 4: Configuring firewall...${NC}"
ufw --force enable
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw reload

# Step 5: Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    if [ -f .env.production.example ]; then
        echo -e "${CYAN}Creating .env from .env.production.example${NC}"
        cp .env.production.example .env
        echo -e "${RED}IMPORTANT: Edit .env file with your actual values before continuing!${NC}"
        echo -e "${YELLOW}Press Enter after editing .env file...${NC}"
        read
    else
        echo -e "${RED}Error: .env.production.example not found${NC}"
        exit 1
    fi
fi

# Step 6: Load environment variables
source .env

# Validate required environment variables
echo -e "${CYAN}Step 5: Validating environment variables...${NC}"
REQUIRED_VARS=("DOMAIN" "MONGODB_PASSWORD" "RABBITMQ_PASSWORD" "JWT_SECRET" "SSL_EMAIL")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ] || [ "${!VAR}" == "CHANGE_THIS"* ] || [ "${!VAR}" == "your-domain.com" ] || [ "${!VAR}" == "your_"* ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Error: The following required variables are not set or need to be changed:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    echo -e "${YELLOW}Please edit .env file and set proper values${NC}"
    exit 1
fi

# Step 7: Replace domain placeholder in nginx config
echo -e "${CYAN}Step 6: Configuring Nginx with domain: ${DOMAIN}${NC}"
sed -i "s/\${DOMAIN}/${DOMAIN}/g" nginx/conf.d/default.conf

# Step 8: Create necessary directories
echo -e "${CYAN}Step 7: Creating directories...${NC}"
mkdir -p nginx/ssl
mkdir -p backups
mkdir -p logs

# Step 9: Stop existing containers
echo -e "${CYAN}Step 8: Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Step 10: Build images
echo -e "${CYAN}Step 9: Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Step 11: Start services (without Nginx first for SSL)
echo -e "${CYAN}Step 10: Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d mongodb rabbitmq backend frontend

# Wait for services to be ready
echo -e "${CYAN}Waiting for services to be healthy...${NC}"
sleep 30

# Step 12: Obtain SSL certificates
echo -e "${CYAN}Step 11: Obtaining SSL certificates...${NC}"
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${SSL_EMAIL} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN} \
    -d api.${DOMAIN} || echo -e "${YELLOW}SSL certificate generation failed. Will use HTTP for now.${NC}"

# Step 13: Start Nginx
echo -e "${CYAN}Step 12: Starting Nginx reverse proxy...${NC}"
docker-compose -f docker-compose.prod.yml up -d nginx

# Step 14: Setup automatic SSL renewal
echo -e "${CYAN}Step 13: Setting up SSL renewal cron job...${NC}"
CRON_JOB="0 0 * * * cd $(pwd) && docker-compose -f docker-compose.prod.yml run --rm certbot renew && docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -

# Step 15: Setup MongoDB backup cron job
echo -e "${CYAN}Step 14: Setting up automated backups...${NC}"
cat > /usr/local/bin/ekyc-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/ekyc"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker exec ekyc-mongodb mongodump --out /backups/backup_$DATE
find $BACKUP_DIR -name "backup_*" -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null
EOF

chmod +x /usr/local/bin/ekyc-backup.sh
BACKUP_CRON="0 2 * * * /usr/local/bin/ekyc-backup.sh"
(crontab -l 2>/dev/null | grep -v "ekyc-backup"; echo "$BACKUP_CRON") | crontab -

# Step 16: Display status
echo ""
echo -e "${GREEN}========================================"
echo -e "   Deployment Complete!"
echo -e "========================================${NC}"
echo ""
echo -e "${CYAN}Services Status:${NC}"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo -e "${CYAN}Access URLs:${NC}"
echo -e "  Frontend:     https://${DOMAIN}"
echo -e "  Backend API:  https://api.${DOMAIN}"
echo -e "  Health Check: https://api.${DOMAIN}/api/health"
echo ""
echo -e "${CYAN}Management:${NC}"
echo -e "  View logs:       docker-compose -f docker-compose.prod.yml logs -f"
echo -e "  Restart service: docker-compose -f docker-compose.prod.yml restart <service>"
echo -e "  Stop all:        docker-compose -f docker-compose.prod.yml down"
echo ""
echo -e "${YELLOW}Important Next Steps:${NC}"
echo -e "  1. Update DNS records to point to this server"
echo -e "  2. Test the application: https://${DOMAIN}"
echo -e "  3. Monitor logs for any issues"
echo -e "  4. Setup monitoring (optional)"
echo ""
echo -e "${GREEN}Deployment completed successfully! ${NC}"