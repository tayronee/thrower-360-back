# Dockerfile
FROM node:20-alpine AS builder

# Cria diretório da aplicação
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copia o código fonte
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS production

WORKDIR /app

# Copia apenas os arquivos necessários para produção
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copia os arquivos compilados do estágio anterior
COPY --from=builder /app/dist ./dist

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Muda para o usuário não-root
USER nestjs

# Expõe a porta
EXPOSE 3000

# Inicia a aplicação usando o arquivo compilado
CMD ["node", "dist/main.js"]
