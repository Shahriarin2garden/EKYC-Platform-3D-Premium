#!/bin/bash
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
echo -e "${CYAN}========================================"
echo "   EKYC Platform - Health Check"
echo -e "========================================${NC}"
echo ""
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi
echo -e "${CYAN}Checking Docker containers...${NC}"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo -e "${CYAN}Service Health Checks:${NC}"
echo -n "Frontend: "
if curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN} | grep -q "200"; then
    echo -e "${GREEN} Healthy${NC}"
else
    echo -e "${RED} Unhealthy${NC}"
fi
echo -n "Backend API: "
if curl -s -o /dev/null -w "%{http_code}" https://api.${DOMAIN}/api/health | grep -q "200"; then
    echo -e "${GREEN} Healthy${NC}"
else
    echo -e "${RED} Unhealthy${NC}"
fi
echo -n "MongoDB: "
if docker exec ekyc-mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN} Healthy${NC}"
else
    echo -e "${RED} Unhealthy${NC}"
fi
echo -n "RabbitMQ: "
if docker exec ekyc-rabbitmq rabbitmq-diagnostics -q ping > /dev/null 2>&1; then
    echo -e "${GREEN} Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi
echo -n "SSL Certificate: "
if echo | openssl s_client -servername ${DOMAIN} -connect ${DOMAIN}:443 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN} Valid${NC}"
else
    echo -e "${YELLOW} Warning${NC}"
fi
echo ""
echo -e "${CYAN}Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""
echo -e "${GREEN}Health check complete!${NC}"