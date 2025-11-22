#!/bin/sh

# wait for MySQL to be truly up
echo "Waiting for DB..."
sleep 10

echo "Importing workflow..."
n8n import:workflow --input=/data/import/workflow.json --replaceExisting

echo "Starting n8n..."
n8n start
