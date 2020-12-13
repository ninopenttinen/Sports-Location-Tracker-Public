FROM node:14.4
WORKDIR /usr/server
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

COPY ./server/package*.json ./
RUN npm install
COPY ./server/* ./

EXPOSE 9000
CMD ["npm", "start"]
#RUN npm run-script dev