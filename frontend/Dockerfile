# Multi-stage build for the public RSVP site.
# Targets:
#   dev  → Vite dev server with HMR
#   prod → static bundle served by nginx:alpine
# The compose file picks which target to use.

# ── Shared dep install ──────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund


# ── Dev target: hot-reloading Vite dev server ───────────────────────
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


# ── Builder: produces /app/dist for prod ────────────────────────────
FROM deps AS builder
COPY . .
# VITE_BACKEND_URL is baked into the bundle at build time.
ARG VITE_BACKEND_URL=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build


# ── Prod target: nginx:alpine serving the static bundle ────────────
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
