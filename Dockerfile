# Build stage
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_APP_PROFILE=staging
ARG VITE_API_BASE_URL
ENV VITE_APP_PROFILE=$VITE_APP_PROFILE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN VITE_APP_PROFILE=$VITE_APP_PROFILE npm run build-only

# Production stage.
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]