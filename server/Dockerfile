FROM node:17-alpine

RUN npm install pm2 -g

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . /app

EXPOSE 5000

ENV NODE_ENV=production

CMD [ "pm2-runtime", "app.js" ]