
# h/t https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:boron

# Patch libssl and gcc
# RUN apk update && apk add sudo
# RUN apk add libssl-dev gcc

# Create app directory
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# Install app dependencies
# COPY package.json /usr/src/app/
# RUN rm -rf node_modules/
# RUN npm install

# Bundle app source
# COPY . /usr/src/app
EXPOSE 8888

# CMD [ "npm", "start" ]

# run with
# docker build -t backend .
# docker run -d -p 49160:8888 --name backend --link gitlab:gitlab backend
# for immediate code updates, try this:
#   -v $(pwd):/usr/src/app

# TODO:
# 1. Create ssh key
# 2. Add to gitlab
# 3. Start agent
