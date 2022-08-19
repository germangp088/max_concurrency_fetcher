FROM node:14.18.0-alpine

WORKDIR /usr

COPY index.js /usr
COPY package.json /usr
COPY package-lock.json /usr
RUN npm install
COPY .env.example /usr/.env

CMD [ "npm", "start" ]