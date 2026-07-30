FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Uploaded profile pictures are persisted via a volume mounted here (see docker-compose.yml)
RUN mkdir -p uploads/profile-pictures

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
