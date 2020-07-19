FROM node:14-slim

WORKDIR /bot
COPY . .

CMD node index.js