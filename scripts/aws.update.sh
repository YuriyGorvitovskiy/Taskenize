#!/bin/sh

echo 'checkout from github'
cd ~/Taskenize/
git checkout origin/master
git pull origin master

echo 'build WebClient'
cd ~/Taskenize/WebClient/
./node_modules/.bin/tsc
./bin/browserify.js

echo 'build WebServer'
cd ~/Taskenize/WebServer/
./node_modules/.bin/tsc

echo 'restart server'
sudo service mongod restart
