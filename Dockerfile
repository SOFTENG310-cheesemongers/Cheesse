FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN cd frontend && npm run build

FROM caddy AS runner
WORKDIR /app
COPY --from=builder /app/frontend/dist .
CMD ["caddy", "file-server", "-r", "/app"]

