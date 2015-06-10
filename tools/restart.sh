#!/usr/bin/env bash

# this script will pull the latest from
# git hub and call forever stop then forever restart on the server

git pull
npm install
npm run build-parser
npm run build-react
npm run build-tallyui

forever stop tallycat
forever start --append --uid "tallycat" server/server.js
#quick patch