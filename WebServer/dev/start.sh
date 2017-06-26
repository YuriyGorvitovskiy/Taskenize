set -e

echo Building Project
./dev/build.sh

echo Start Local Server
node ./bin/app.js
