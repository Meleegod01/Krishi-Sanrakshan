# Combine Node.js and Python
FROM node:20-slim AS node_base
FROM python:3.9-slim

# Copy node from node_base
COPY --from=node_base /usr/local/bin/node /usr/local/bin/
COPY --from=node_base /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy all code
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir fastapi uvicorn pika psycopg2-binary requests pydantic python-multipart

# Install Node dependencies
WORKDIR /app/crop_backend/ingestion_api
RUN npm install

WORKDIR /app

# Make start script executable
RUN chmod +x crop_backend/monolith/start.sh

# Expose all ports (Note: Cloud platforms usually only allow one public port)
# We will use Ingestion API as the primary if needed, but Monolith allows internal routing
EXPOSE 3000 8001 8002

CMD ["./crop_backend/monolith/start.sh"]
