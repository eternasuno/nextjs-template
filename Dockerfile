FROM node:18-alpine

WORKDIR /app
COPY . .

EXPOSE 80

RUN yarn install & \
    yarn start
