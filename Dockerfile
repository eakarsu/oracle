FROM node:24-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY frontend/index.html frontend/vite.config.js ./
COPY frontend/src ./src
RUN npm run build

FROM node:24-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS backend-dependencies
WORKDIR /build/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:24-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS runtime
ENV NODE_ENV=production \
    BACKEND_HOST=0.0.0.0 \
    ALLOW_PUBLIC_BIND=true \
    BACKEND_PORT=3001
WORKDIR /app/backend
COPY --from=backend-dependencies --chown=node:node /build/backend/node_modules ./node_modules
COPY --chown=node:node backend/package.json backend/package-lock.json backend/server.js ./
COPY --chown=node:node backend/config ./config
COPY --chown=node:node backend/lib ./lib
COPY --chown=node:node backend/middleware ./middleware
COPY --chown=node:node backend/migrations ./migrations
COPY --chown=node:node backend/routes/auth.js backend/routes/procurement.js ./routes/
COPY --chown=node:node backend/scripts ./scripts
COPY --from=frontend-build --chown=node:node /build/frontend/dist ./public
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
