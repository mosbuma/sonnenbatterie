# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json first
COPY package.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5001 5002

# Run the application
CMD ["bun", "start", "--host"]