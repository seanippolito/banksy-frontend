# -------------------------------
# Stage 1: Builder
# -------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only frontend app
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

RUN npm install -g pnpm
COPY apps/frontend/pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/frontend/package.json ./package.json

RUN pnpm install --frozen-lockfile
RUN pnpm build

# -------------------------------
# Stage 2: Runner
# -------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only built frontend and its package.json
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/package.json ./package.json

# Copy node_modules for frontend (not root)
COPY --from=builder /app/apps/frontend/node_modules ./node_modules

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]

# -------------------------------
# Stage 3: Development (Turbopack)
# -------------------------------
FROM node:20-alpine AS dev
WORKDIR /app

# Copy metadata and source
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/frontend ./apps/frontend
COPY packages ./packages

# Install pnpm and dependencies inside container
RUN npm install -g pnpm
RUN pnpm install

EXPOSE 3000

# Start Next.js dev server with Turbopack
CMD ["pnpm", "--filter", "frontend", "dev", "--turbo"]
