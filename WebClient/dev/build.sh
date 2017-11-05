set -e

echo Compiling Typescript
./node_modules/.bin/tsc

echo Browserifying
mkdir -p ./br
# ./bin/browserify.js
./node_modules/.bin/browserify ./js/index.js --debug | ./node_modules/.bin/exorcist ./br/bundle.js.map > ./br/bundle.js
