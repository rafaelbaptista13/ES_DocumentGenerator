FROM node:lts-alpine as build 

WORKDIR /web-app

COPY package.json .
RUN npm install 
COPY . .
RUN npm run build

FROM nginx
COPY /etc/nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf
COPY /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf 

COPY --from=build /web-app/build /usr/share/nginx/html 
