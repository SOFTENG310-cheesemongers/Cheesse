FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json .
RUN npm install --ignore-scripts

COPY ./frontend .
RUN npm run build

FROM caddy:2-alpine AS runner
WORKDIR /app
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
COPY --from=builder /app/dist .
USER nonroot
CMD ["caddy", "file-server", "-r", "/app"]

