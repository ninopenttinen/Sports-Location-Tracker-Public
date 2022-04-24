FROM node:14.4 as build-deps
WORKDIR /usr/src/app

ARG BASEPATH
ENV REACT_APP_BASE_URL=$BASEPATH

COPY ./webapp/package* ./
# Replace word "BASEPATH" in package.json with environment variable
RUN sed -i "s,BASEPATH,${REACT_APP_BASE_URL},g" package.json
RUN npm install
COPY ./webapp/public ./public
COPY ./webapp/src ./src
RUN npm run-script build

FROM nginx:1.19
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
#COPY ./certs/nginx/* /etc/nginx/ssl/
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]