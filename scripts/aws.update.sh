#!/bin/sh

echo 'stop server'
sudo service taskenize stop

echo 'clean log'
sudo rm /var/log/taskenize.log

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

echo 'start server'
sudo service taskenize start
