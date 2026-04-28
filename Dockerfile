# ---------- Build stage ----------
FROM node:22-alpine AS build-stage

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY . .

ARG VITE_APP_PROFILE=staging
ARG VITE_API_BASE_URL

ENV VITE_APP_PROFILE=$VITE_APP_PROFILE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# ---------- Production stage ----------
FROM nginx:1.26-alpine AS production-stage

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Create non-root user
RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup

# Set permissions
RUN chown -R nginxuser:nginxgroup /usr/share/nginx/html

USER nginxuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080 || exit 1

CMD ["nginx", "-g", "daemon off;"]