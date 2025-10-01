# -------------------------------
# Simple production build (frontend)
# -------------------------------
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy everything (since this is a monorepo)
COPY . .

# Set env for production
ENV NODE_ENV=production

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build Next.js frontend
RUN pnpm --filter frontend build

# Expose Next.js default port
EXPOSE 3000

# Run production server
CMD ["pnpm", "--filter", "frontend", "start"]
