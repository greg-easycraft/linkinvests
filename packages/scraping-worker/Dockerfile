# Stage 1: The Build Stage
# We start with a Node.js base image to build the application.
FROM node:22.19-alpine AS builder

# Set the working directory inside the container.
WORKDIR /app

# Install pnpm globally.
RUN npm install -g pnpm@10.17.0

# Copy the package.json and pnpm-lock.yaml to leverage Docker's layer caching.
# This ensures that we only reinstall dependencies if the package files change.
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies using pnpm.
RUN pnpm install --ignore-scripts

# Copy the rest of the application source code into the container.
COPY . .

# Skip environment validation during build as variables are only needed at runtime.
ENV SKIP_ENV_VALIDATION=1

# Build the Next.js application for production.
RUN pnpm run build

# Stage 2: The Production Stage
# We use a slimmed-down Node.js base image for the final production image.
FROM node:22.19-alpine AS runner

# Set the working directory for the runner.
WORKDIR /app

# Copy only the package files needed for production install.
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install only production dependencies.
RUN npm install -g pnpm@10.17.0 && pnpm install --prod --ignore-scripts

# Copy the built application from the builder stage.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set the environment variable for the port. Next.js defaults to 3000.
ENV PORT=3000

# Expose the port that the application will run on.
EXPOSE 3000

# Run the application in production mode.
CMD ["pnpm", "run", "start"]