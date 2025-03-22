# Use an official Node.js image as base
FROM node:20

# Set working directory in container
WORKDIR /backend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Ensure Node.js resolves ES modules properly
CMD ["npm", "run", "dev"]
