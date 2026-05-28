FROM node:20-alpine

RUN apk update

WORKDIR /usr/src/app
ENV PORT=5050

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY ./ ./

CMD ["npm", "start"]
