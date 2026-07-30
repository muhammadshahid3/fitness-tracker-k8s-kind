# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Baked into the JS bundle at build time. Defaults assume the nginx stage
# below proxies /api and /uploads to the backend on the same origin, which
# is how docker-compose.yml wires things up. Override with --build-arg if
# you're pointing at a different backend host.
ARG VITE_API_URL=/api
ARG VITE_API_ORIGIN=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_ORIGIN=$VITE_API_ORIGIN

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
