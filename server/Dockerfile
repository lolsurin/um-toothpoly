FROM node:17-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . /app

EXPOSE 5000

ENV NODE_ENV=production

CMD [ "npm", "start" ]