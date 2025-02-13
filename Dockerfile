# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and built assets from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/backend/dist ./backend/dist

# Install production dependencies only
RUN npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy environment files
COPY .env.production .env

# Expose ports
EXPOSE 3000 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the working directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Start both frontend and backend
CMD ["npm", "run", "start"] 