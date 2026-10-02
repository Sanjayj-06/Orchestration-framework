# ── Stage 1: Build the React app ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install deps
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Copy the rest of the source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
