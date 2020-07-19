FROM node:14

WORKDIR /bot
COPY . .
RUN yarn install

CMD node index.js