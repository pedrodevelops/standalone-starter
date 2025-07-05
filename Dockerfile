FROM node:lts-slim

RUN apt-get update -y && apt-get install -y openssl

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock to the working directory
COPY package.json pnpm-lock.yaml* ./

# Install the application dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS application
RUN pnpm run build

# Expose the application port
EXPOSE 8080

# Command to run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start"]
