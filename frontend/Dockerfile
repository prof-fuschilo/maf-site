FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install

COPY . .

# Vazio = chamadas /api relativas (mesmo domínio via Nginx). Para API em outro domínio: --build-arg REACT_APP_BACKEND_URL=https://api.seudominio.com
ARG REACT_APP_BACKEND_URL=""
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
