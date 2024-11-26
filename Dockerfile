FROM node:16.13.0

WORKDIR /app

COPY . /app
RUN npm install --production

EXPOSE 3000

ENV NODE_ENV=production

CMD [npm, start]