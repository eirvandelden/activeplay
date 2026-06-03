# syntax = docker/dockerfile:1

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx gulp sass


FROM node:${NODE_VERSION}-alpine AS final

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5050

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && \
    npm cache clean --force

COPY --from=build /usr/src/app/app.js ./
COPY --from=build /usr/src/app/newrelic.js ./
COPY --from=build /usr/src/app/lib ./lib
COPY --from=build /usr/src/app/middlewares ./middlewares
COPY --from=build /usr/src/app/models ./models
COPY --from=build /usr/src/app/routes ./routes
COPY --from=build /usr/src/app/servers ./servers
COPY --from=build /usr/src/app/views ./views
COPY --from=build /usr/src/app/public ./public

USER node

EXPOSE 5050

CMD ["node", "--optimize-for-size", "--max-old-space-size=460", "app.js"]
