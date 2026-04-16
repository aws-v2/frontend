# ---------- Build stage ----------
FROM node:22-slim AS build-stage

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build arguments
ARG VITE_APP_PROFILE=staging
ARG VITE_API_BASE_URL

# Expose to Vite
ENV VITE_APP_PROFILE=${VITE_APP_PROFILE}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build app
RUN npm run build


# ---------- Production stage ----------
FROM nginx:stable-alpine AS production-stage

# Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


