FROM node:lts-alpine

WORKDIR /web-app

COPY package.json .
RUN npm install 
COPY . .
RUN npm run build
RUN npm install -g serve

CMD ["serve", "-s", "build"]

#FROM nginx
#COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
#RUN rm /etc/nginx/conf.d/default.conf
#COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf 
#COPY --from=build /web-app/build /usr/share/nginx/html 
