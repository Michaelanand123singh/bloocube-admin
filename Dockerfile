# Multi-stage build for Next.js admin app

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next requires this to be set at build time for certain features
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_ADMIN_API_URL
ENV NEXT_PUBLIC_ADMIN_API_URL=${NEXT_PUBLIC_ADMIN_API_URL}

# Debug output
RUN echo "========================================="
RUN echo "Building with NEXT_PUBLIC_ADMIN_API_URL: $NEXT_PUBLIC_ADMIN_API_URL"
RUN echo "========================================="

# Fail build if not set
RUN if [ -z "$NEXT_PUBLIC_ADMIN_API_URL" ]; then \
      echo "ERROR: NEXT_PUBLIC_ADMIN_API_URL is not set!"; \
      exit 1; \
    fi

RUN npm run build

# Verify it's embedded in the build
RUN echo "Verifying API URL in build output..."
RUN grep -r "api-backend.bloocube.com" .next/static/ | head -n 2 || echo "WARNING: API URL not found in static files"

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

# Cloud Run expects the server on $PORT
ENV PORT=8080
EXPOSE 8080

USER nextjs

CMD ["npm", "run", "start", "--", "-p", "8080"]