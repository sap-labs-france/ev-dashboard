FROM node:16-alpine as builder

ARG build

WORKDIR /usr/builder

COPY package.json package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force
RUN HUSKY_SKIP_INSTALL=1 npm install --force

COPY NOTICE LICENSE ./
COPY src ./src
COPY *.json ./
COPY *.js ./
COPY docker/config.json ./src/assets/config.json

RUN npm run build:${build}

FROM nginx:alpine

RUN [ -e /etc/nginx/conf.d/default.conf ] && mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf-disabled
COPY docker/nginx-dashboard.conf /etc/nginx/conf.d/dashboard.conf

WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/builder/dist ./

COPY docker/autoconfig.sh /autoconfig.sh
RUN chmod +x /autoconfig.sh

CMD /autoconfig.sh && nginx -g 'daemon off;'
