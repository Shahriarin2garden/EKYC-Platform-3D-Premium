#!/bin/bash
set -e
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="ekyc_backup_${DATE}"
echo "Creating backup: ${BACKUP_NAME}"
mkdir -p ${BACKUP_DIR}
docker exec ekyc-mongodb mongodump \
    --out /backups/${BACKUP_NAME} \
    --authenticationDatabase admin
cd ${BACKUP_DIR}
tar -czf ${BACKUP_NAME}.tar.gz ${BACKUP_NAME}
rm -rf ${BACKUP_NAME}
echo "Backup created: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
find ${BACKUP_DIR} -name "ekyc_backup_*.tar.gz" -mtime +30 -delete
echo "Backup complete!"