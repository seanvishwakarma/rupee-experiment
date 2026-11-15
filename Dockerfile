# Dockerfile for ₹1 Experiment — Node.js production image
FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies if present
RUN if [ -f package-lock.json ]; then npm ci --omit=dev && npm cache clean --force; fi

# Copy application source
COPY server.js ./server.js
COPY src ./src
COPY public ./public
COPY .env.example ./.env.example

# Create data directory and ensure node user owns it
RUN mkdir -p data && chown -R node:node /app

# Run as non-root user
USER node

# Expose the port the app listens on
EXPOSE 3000

# Health check for the platform
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]