#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Get current timestamp for log rotation
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Check if dev.log exists and rotate it
if [ -f logs/dev.log ]; then
  # Keep only the 5 most recent backups
  ls -t logs/dev.log.* 2>/dev/null | tail -n +5 | xargs rm -f 2>/dev/null
  
  # Rotate the current log with timestamp
  mv logs/dev.log "logs/dev.log.$TIMESTAMP"
  echo "Rotated logs/dev.log to logs/dev.log.$TIMESTAMP"
else
  echo "No existing log file to rotate"
fi

# Create an empty log file
touch logs/dev.log
echo "Created new log file at logs/dev.log"