# Use official Node image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "src/app.js"]