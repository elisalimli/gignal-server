FROM node:12
WORKDIR /app

COPY package.json .
COPY yarn.lock . 

RUN yarn
COPY .env .

ENV NODE_ENV production
COPY . .
EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node