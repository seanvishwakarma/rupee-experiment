# Dockerfile for ₹1 Experiment — Node.js production image
FROM node:20-alpine

WORKDIR /app

# Copy dependency files first (for layer caching)
COPY package.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY server.js ./server.js
COPY src ./src
COPY public ./public
COPY .env.example ./.env.example

# Create data directory
RUN mkdir -p data

# Run as non-root user
USER node

# Expose the port the app listens on
EXPOSE 3000

# Health check for the platform
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]