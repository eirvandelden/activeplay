FROM node:boron-alpine

RUN apk update

COPY package.json /tmp/package.json
RUN cd /tmp && npm i -q
RUN npm i -q gulp
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app

WORKDIR /usr/src/app
COPY ./ /usr/src/app

RUN npm i -q -g gulp

CMD gulp
