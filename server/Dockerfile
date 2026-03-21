# Base image
FROM node:18-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package trước để cache
COPY package*.json ./

# Cài dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port (sẽ map ngoài)
EXPOSE 3000

# Chạy app
CMD ["node", "server.js"]