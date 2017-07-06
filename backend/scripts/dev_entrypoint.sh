#!/bin/bash

cd /usr/src/app
npm install
./node_modules/nodemon/bin/nodemon.js --legacy-watch server.js
