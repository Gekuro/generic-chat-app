FROM node:21.4.0

WORKDIR /usr/node/generic-chat-app

COPY package*.json .
RUN npm i

EXPOSE 80:80

COPY . .
CMD ["npm","start"]
