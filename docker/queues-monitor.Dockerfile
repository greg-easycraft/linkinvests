# Stage 1: The Build Stage
# We start with a Node.js base image to build the application.
FROM node:22.19-alpine AS builder

# Set the working directory inside the container.
WORKDIR /app

# Install pnpm globally.
RUN npm install -g pnpm@10.17.0

# Copy workspace configuration files to leverage Docker's layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy only the packages we need for the sourcing worker
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY packages/eslint-config ./packages/eslint-config
COPY packages/queues-monitor ./packages/queues-monitor

# Install dependencies for the sourcing worker workspace and its dependencies
RUN pnpm install --filter queues-monitor... --ignore-scripts

# Build the shared and db packages first
RUN pnpm --filter shared build
RUN pnpm --filter db build

# Build the sourcing worker application for production.
RUN pnpm --filter queues-monitor build

# Stage 2: The Production Stage
# We use a slimmed-down Node.js base image for the final production image.
FROM node:22.19-alpine AS runner

# Set the working directory for the runner.
WORKDIR /app

# Install pnpm globally.
RUN npm install -g pnpm@10.17.0

# Copy workspace configuration for production install
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy only the production package.json files for dependency resolution
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/queues-monitor/package.json ./packages/queues-monitor/

# Copy built shared and db packages (needed at runtime)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist

# Install only production dependencies for sourcing worker
RUN pnpm install --filter queues-monitor... --prod --ignore-scripts

# Copy the built sourcing worker application from the builder stage.
COPY --from=builder /app/packages/queues-monitor/dist ./packages/queues-monitor/dist

# Set the environment variable for the port.
ENV PORT=8082

# Expose the port that the application will run on.
EXPOSE 8082

# Set working directory to sourcing worker package
WORKDIR /app/packages/queues-monitor

# Run the application in production mode.
CMD ["pnpm", "start:prod"]