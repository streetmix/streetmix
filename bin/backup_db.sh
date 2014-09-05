#!/bin/bash

# Constants
let LOG_LEVEL_DEBUG=10
let LOG_LEVEL_INFO=20
let LOG_LEVEL_ERROR=30

MONGO_CLI_DOWNLOAD_LOCATION="https://s3.amazonaws.com/forever.codeforamerica.org/streetmix/mongodb-linux-x86_64-2.4.5.tgz"
WORKDIR=$(mktemp -d)
ENVIRONMENT=$NODE_ENV
BACKUP_FILEPATH=$WORKDIR/"db."$ENVIRONMENT"-"$(date +%Y%m%d%H%M)".tgz"

# Functions

function log_debug { if [ $LOG_LEVEL -le $LOG_LEVEL_DEBUG ]; then printf "[DEBUG] %s\n" "$@"; fi; }
function log_info  { if [ $LOG_LEVEL -le $LOG_LEVEL_INFO  ]; then printf "[INFO]  %s\n" "$@"; fi;  }
function log_error { if [ $LOG_LEVEL -le $LOG_LEVEL_ERROR ]; then printf "[ERROR] %s\n" "$@"; fi;  }

function download_mongo_binaries {

  cd $WORKDIR
  curl --silent --output mongo.tgz $MONGO_CLI_DOWNLOAD_LOCATION
  tar xzf mongo.tgz
  cd mongo*/bin
  MONGODUMP_PATH=$WORKDIR/mongo*/bin/mongodump

} # END function - download_mongo_binaries

function backup {

  mongo_url=$MONGOHQ_URL

  mongo_username=$(echo "$mongo_url" | awk -F':' '{print $2}' | awk -F'/' '{print $3}')
  mongo_password=$(echo "$mongo_url" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
  mongo_hostname=$(echo "$mongo_url" | awk -F'@' '{print $2}' | awk -F':' '{print $1}')
  mongo_port=$(echo "$mongo_url" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
  mongo_dbname=$(echo "$mongo_url" | awk -F'/' '{print $4}')

  if [ 0 -eq 1 ]; then
  $MONGODUMP_PATH \
    --host $mongo_hostname \
    --port $mongo_port \
    --username $mongo_username \
    --password $mongo_password \
    --db $mongo_dbname \
    --out $WORKDIR/dump
  fi

  cd $WORKDIR
  tar cvzf $BACKUP_FILEPATH dump

} 

function upload_to_s3 {
//
}

function send_email {
//
}

# Main

LOG_LEVEL=$(echo $LOG_LEVEL | tr [:upper:] [:lower:])
case $LOG_LEVEL in
    debug)
        let LOG_LEVEL=$LOG_LEVEL_DEBUG
        ;;
    error)
        let LOG_LEVEL=$LOG_LEVEL_ERROR
        ;;
    *)
        let LOG_LEVEL=$LOG_LEVEL_INFO
        ;;
esac

log_debug "WORKDIR = $WORKDIR"

# Download MongoDB binaries if necessary
download_mongo_binaries

# Do the backup
backup

# Upload to S3 folder
touch $BACKUP_FILEPATH
upload_to_s3

# Send email