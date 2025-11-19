#!/bin/bash
set -e
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.tar.gz>"
    echo "Available backups:"
    ls -lh ./backups/*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi
BACKUP_FILE=$1
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi
echo "Restoring from: $BACKUP_FILE"
TEMP_DIR=$(mktemp -d)
tar -xzf $BACKUP_FILE -C $TEMP_DIR
BACKUP_DIR=$(find $TEMP_DIR -type d -name "ekyc_backup_*" | head -n 1)
if [ -z "$BACKUP_DIR" ]; then
    echo "Error: Invalid backup file"
    rm -rf $TEMP_DIR
    exit 1
fi
docker exec -i ekyc-mongodb mongorestore \
    --drop \
    --authenticationDatabase admin \
    /backups/$(basename $BACKUP_DIR)
rm -rf $TEMP_DIR
echo "Restore complete!"