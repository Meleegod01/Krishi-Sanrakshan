#!/bin/bash

# Start ML Service (Port 8001)
echo "Starting ML Service..."
cd /app/crop_backend/ml_service && uvicorn main:app --host 0.0.0.0 --port 8001 &

# Start Ingestion API (Port 3000)
echo "Starting Ingestion API..."
cd /app/crop_backend/ingestion_api && node index.js &

# Start Dashboard API (Port 8002)
echo "Starting Dashboard API..."
cd /app/crop_backend/dashboard_api && uvicorn main:app --host 0.0.0.0 --port 8002 &

# Start Analysis Worker
echo "Starting Analysis Worker..."
cd /app/crop_backend/analysis_worker && python worker.py &

# Start Data Fusion Worker
echo "Starting Data Fusion Worker..."
cd /app/crop_backend/data_fusion_worker && python worker.py &

echo "All services started. Monitoring..."

# Keep the container running
wait
