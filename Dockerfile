FROM node:lts-alpine3.11
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    bash \
    && npm install \
    && apk del make g++ python
# Copy app code
COPY ./index.js ./index.js
COPY ./webapp/build ./webapp/build
# Copy config and ssh key
COPY ./.env ./.env

# Expose port and start application
EXPOSE 4000
CMD [ "npm", "start" ]