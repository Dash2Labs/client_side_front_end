# Stage 1: Build
FROM node:latest AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
COPY webpack* ./

# Install dependencies, including TypeScript
RUN npm install
RUN npm install -g typescript

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build:prod

# Delete the node_modules folder to reduce the image size
RUN rm -rf node_modules

# Install only production dependencies
RUN npm install --only=production

# Stage 2: Runtime
FROM node:latest

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/clientserver/.env.production ./dist/.env.production
COPY --from=builder /app/customerSettings.json ./dist/server/customerSettings.json
COPY --from=builder /app/clientserver/.env.keys ./dist/.env.keys
COPY --from=builder /app/clientserver/*.json ./dist/

VOLUME ["/app/build"]

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]