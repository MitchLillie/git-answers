#!/bin/bash

CONTAINER_NAME=backend_DEV

docker stop ${CONTAINER_NAME}
docker rm ${CONTAINER_NAME}
docker run -d -p 49160:8888 --name ${CONTAINER_NAME} --link gitlab:gitlab -e "NODE_ENV=development" -v `pwd`:/usr/src/app backend /usr/src/app/scripts/dev_entrypoint.sh

# see also http://paislee.io/the-ultimate-nodejs-development-setup-with-docker/
