set -e
echo 'unit test'
./node_modules/.bin/mocha -r ts-node/register ts/test/**/*.ts ts/test/*.ts
echo 'compile'
./node_modules/.bin/tsc
echo 'lint'
./node_modules/.bin/tslint ts/**/*.ts ts/*.ts
echo 'code coverage'
./node_modules/.bin/istanbul cover --include-all-sources --root ./bin/ ./node_modules/mocha/bin/_mocha bin/test/**/*.js bin/test/*.js
./node_modules/.bin/istanbul check-coverage --functions 47
echo 'Security velnarability check'
./node_modules/.bin/snyk test
./node_modules/.bin/nsp check
