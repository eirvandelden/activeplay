FROM node:20-alpine

RUN apk update

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY ./ ./

CMD ["npm", "start"]
