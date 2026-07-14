FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
ARG MONGODB_URI
ARG AUTH_SECRET

ENV MONGODB_URI=$MONGODB_URI
ENV AUTH_SECRET=$AUTH_SECRET

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Production deps
COPY package.json package-lock.json* ./
RUN npm ci --production

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]
