#!/usr/bin/env node
var browserify = require('browserify');
var fs = require('fs');

var bundler = new browserify({debug: true});

bundler.add('./js/index.js');
// bundler.plugin('minifyify', {map: 'bundle.js.map'});
bundler.bundle(function (err, src, map) {
    if (err) console.log(err);
    fs.writeFileSync('./br/bundle.js', src);
    fs.writeFileSync('./br/bundle.js.map', map);
});
