FROM node:24-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY package*.json ./

# Install dependencies with --ignore-scripts for security
RUN npm ci --ignore-scripts

# Copy only necessary source files (explicit to avoid sensitive data)
COPY src/ ./src/
COPY tsconfig.json ./
COPY vitest.config.ts ./

# Build TypeScript
RUN npm run build

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
