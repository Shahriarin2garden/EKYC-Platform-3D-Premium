#!/bin/bash
set -e
echo "========================================"
echo "   EKYC Platform - Quick Update"
echo "========================================"
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'
echo -e "${CYAN}Pulling latest changes...${NC}"
git pull origin master
echo -e "${CYAN}Rebuilding services...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache
echo -e "${CYAN}Restarting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}Update complete!${NC}"
echo ""
docker-compose -f docker-compose.prod.yml ps