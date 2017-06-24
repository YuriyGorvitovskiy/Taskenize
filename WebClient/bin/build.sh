set -e

echo Compiling Typescript
./node_modules/.bin/tsc

echo Browserifying
mkdir -p ./br
./bin/browserify.js
