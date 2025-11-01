# Stage 1: The Build Stage
# We start with a Node.js base image to build the application.
FROM node:22.19-alpine AS builder

# Set the working directory inside the container.
WORKDIR /app

# Install pnpm globally.
RUN npm install -g pnpm@10.17.0

# Copy workspace configuration files to leverage Docker's layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy only the packages we need for the frontend
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY packages/eslint-config ./packages/eslint-config
COPY packages/frontend ./packages/frontend

# Install dependencies for the frontend workspace and its dependencies
RUN pnpm install --filter @linkinvests/frontend... --ignore-scripts

# Skip environment validation during build as variables are only needed at runtime.
ENV SKIP_ENV_VALIDATION=1

# Build the shared and db packages first
RUN pnpm --filter @linkinvests/shared build
RUN pnpm --filter @linkinvests/db build

# Build the Next.js application for production.
RUN pnpm --filter @linkinvests/frontend build

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
COPY --from=builder /app/packages/frontend/package.json ./packages/frontend/

# Copy built shared and db packages (needed at runtime)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist

# Install only production dependencies for frontend
RUN pnpm install --filter @linkinvests/frontend --prod --ignore-scripts

# Copy the built frontend application from the builder stage.
COPY --from=builder /app/packages/frontend/.next ./packages/frontend/.next
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public

# Set the environment variable for the port. Next.js defaults to 3000.
ENV PORT=3000

# Expose the port that the application will run on.
EXPOSE 3000

# Set working directory to frontend package
WORKDIR /app/packages/frontend

# Run the application in production mode.
CMD ["pnpm", "start"]