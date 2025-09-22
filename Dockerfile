FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json .
RUN npm install --ignore-scripts

COPY ./frontend ./frontend
RUN cd frontend && npm run build

FROM caddy AS runner
WORKDIR /app
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
COPY --from=builder /app/frontend/dist .
USER nonroot
CMD ["caddy", "file-server", "-r", "/app"]

