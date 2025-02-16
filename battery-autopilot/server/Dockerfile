# We are using bun so we have easy Typescript access
FROM oven/bun:latest

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5002

# Run the application
CMD ["bun", "start"]