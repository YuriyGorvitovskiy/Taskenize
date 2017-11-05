set -e
echo 'compile'
./node_modules/.bin/tsc
echo 'lint'
./node_modules/.bin/tslint ts/**/*.{ts,tsx} ts/*.{ts,tsx}
echo 'Security velnarability check'
./node_modules/.bin/snyk test
./node_modules/.bin/nsp check
