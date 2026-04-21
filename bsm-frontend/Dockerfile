FROM node:20-alpine

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ code frontend
COPY . .

# Mở cổng 5173 (Cổng mặc định của Vite)
EXPOSE 5173

# Chạy lệnh npm run dev
CMD ["npm", "run", "dev", "--", "--host"]