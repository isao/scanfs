//require all .js files in __dirname

var fs = require('fs'),
    resolve = require('path').resolve;

function load(name) {
    var path;
    if(name.match(/[.]js$/)) {
        path = resolve(__dirname, name);
        if(path !== __filename) {
            require(path);
        }
    }
}

fs.readdir(__dirname, function onreaddir(err, list) {
    list.forEach(load);
});
