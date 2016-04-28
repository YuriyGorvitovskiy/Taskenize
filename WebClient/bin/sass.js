var sass = require('node-sass');
var fs = require('fs');

exports.render = function() {
    var cssFile = './css/tz.css';
    var cssMapFile = cssFile + ".map";

    sass.render({
        file: './sass/tz-top.scss',
        outputStyle: 'compressed',
        sourceMap: cssMapFile,
        sourceMapContents: true
    }, function(error, result) { // node-style callback from v3.0.0 onwards
        if (error) {
            console.log(error.status); // used to be "code" in v2x and below
            console.log(error.column);
            console.log(error.message);
            console.log(error.line);
        } else {
            fs.writeFileSync(cssFile, result.css);
            fs.writeFileSync(cssMapFile, result.map);
            console.log("CSS file '" + cssFile + "' and Map file '" + cssMapFile + "'saved.");
        }
    });
};
