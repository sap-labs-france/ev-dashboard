FROM node:lts-alpine as builder

ARG build

WORKDIR /usr/builder

COPY package.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force
RUN npm install

COPY src ./src
COPY *.json ./
COPY *.js ./
COPY docker/config.json ./src/assets/config.json
RUN npm run build:${build}

FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/builder/dist ./