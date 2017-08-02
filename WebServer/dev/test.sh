set -e
./node_modules/.bin/mocha -r ts-node/register ts/test/**/*.ts
./node_modules/.bin/tsc
./node_modules/.bin/istanbul cover --include-all-sources --root ./bin/ ./node_modules/mocha/bin/_mocha bin/test/**/*.js
./node_modules/.bin/istanbul check-coverage --functions 100
