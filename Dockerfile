# Stage 1: Build the React app
FROM node:16.20.2-alpine AS build
WORKDIR /app

# Leverage caching by installing dependencies first
COPY package.json package-lock.json tsconfig.json ./
RUN npm install --frozen-lockfile --include=dev

# Copy the environment file
COPY .env.production .env
# Copy the rest of the application code and build for production
COPY public ./public
COPY src ./src
# COPY . ./
RUN npm run build


# # Stage 2: Development environment
# FROM node:16.20.2-alpine AS development
# WORKDIR /app

# # Copy the environment file
# COPY .env.development .env

# # Install dependencies again for development
# COPY package.json package-lock.json tsconfig.json ./
# RUN npm install --frozen-lockfile --include=dev

# # Copy the full source code
# COPY public ./public
# COPY src ./src
# # COPY . ./

# # Expose port for the development server
# EXPOSE 3000
# CMD ["npm", "start"]


# Stage 3: Production environment
FROM nginx:alpine AS production

# Copy the production build artifacts from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose the default NGINX port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]