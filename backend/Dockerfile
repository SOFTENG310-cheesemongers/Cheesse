FROM node:24-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
