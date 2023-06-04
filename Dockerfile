FROM node:18-alpine

WORKDIR /app
COPY . .

EXPOSE 80

RUN yarn

CMD sh -c 'yarn start'