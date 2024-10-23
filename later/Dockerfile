FROM node:14-alpine
WORKDIR /usr/src

COPY . ./
RUN npm install
ENV NODE_ENV=production
RUN npm run build:prod
RUN npm prune --production
ENV BASE_URL_PROD=https://orion-server.internal.yellowground-355afd47.westus2.azurecontainerapps.io
ENV BASE_URL=https://orion-server.internal.yellowground-355afd47.westus2.azurecontainerapps.io
ENV CLIENT_URL=https://orion.yellowground-355afd47.westus2.azurecontainerapps.io

EXPOSE 3000
CMD ["npm", "start"]
