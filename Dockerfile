# Dockerfile para Next.js en Coolify
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Build de la aplicación
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Healthcheck simple
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/login || exit 1

# Comando de inicio
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js"]
