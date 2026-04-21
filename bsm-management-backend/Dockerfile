FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

#  Cài Python
RUN apk add --no-cache python3 py3-pip

COPY . .

EXPOSE 5000

CMD ["npm", "start"]