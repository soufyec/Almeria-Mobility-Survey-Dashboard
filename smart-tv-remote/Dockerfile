FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
ENV PORT=3000 DATA_DIR=/data
VOLUME ["/data"]
# network_mode: host es necesario para SSDP (multicast) y para que la TV alcance las URLs DLNA
CMD ["node", "server/index.js"]
