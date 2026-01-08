# Use Node.js LTS
FROM node:18-alpine

# Cria diretório
WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm install

# Copia o código
COPY . .

# Expõe porta 3000
EXPOSE 3000

# Inicia em modo dev (hot-reload)
CMD ["npm", "run", "dev"]