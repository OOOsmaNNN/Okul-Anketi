FROM node:20-alpine

WORKDIR /app

# Tüm dosyaları kopyala
COPY . .

# Backend bağımlılıklarını yükle
WORKDIR /app/backend
RUN npm install

# Tekrar kök dizine dön
WORKDIR /app

EXPOSE 3000

CMD ["node", "backend/server.js"]
