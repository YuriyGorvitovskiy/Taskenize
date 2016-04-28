#!/usr/bin/env node
var browserify = require('browserify');
var fs = require('fs');
var sass = require('./sass');

var bundler = new browserify({debug: true});

var bundleFile = './br/bundle.js';
var bundleMapFile = bundleFile + '.map';

bundler.add('./js/index.js');
bundler.plugin('minifyify', {map: 'bundle.js.map'});
bundler.bundle({debug: true}, function (err, src, map) {
    if (err) {
        console.log(err);
    } else {
        fs.writeFileSync(bundleFile, src);
        fs.writeFileSync(bundleMapFile, map);
        console.log("JS Bundle file '" + bundleFile + "' and Map file '" + bundleMapFile + "'saved.");

        sass.render();
    }
});
