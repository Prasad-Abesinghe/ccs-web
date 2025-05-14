# Stage 1: Build
FROM node:18.18.0-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_USE_DUMMY_DATA
ENV NEXT_PUBLIC_USE_DUMMY_DATA=$NEXT_PUBLIC_USE_DUMMY_DATA
ARG AZURE_AD_CLIENT_ID
ENV AZURE_AD_CLIENT_ID=$AZURE_AD_CLIENT_ID
ARG AZURE_AD_CLIENT_SECRET
ENV AZURE_AD_CLIENT_SECRET=$AZURE_AD_CLIENT_SECRET
ARG AZURE_AD_TENANT_ID
ENV AZURE_AD_TENANT_ID=$AZURE_AD_TENANT_ID
ARG NEXT_PUBLIC_BACKEND_API_URL
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ARG NEXTAUTH_DEBUG
ENV NEXTAUTH_DEBUG=$NEXTAUTH_DEBUG

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Stage 2: Runtime
FROM node:18.18.0-alpine
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/package.json .
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/resources ./resources

# Install production dependencies only
RUN npm install -g next

# Configure environment
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start command
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
