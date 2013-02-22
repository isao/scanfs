#!/usr/bin/env node
//
// require all js files in __dirname, or just the ones on argv
//
var fs = require('fs'),
    path = require('path'),
    files = process.argv.slice(2),
    JS_RE = /[.]js$/;


function reqthese(err, list) {
    list.forEach(function(name) {
        if(name.match(JS_RE)) {
            require(path.resolve(__dirname, name));
        }
    });
}

files.length ?
    files.map(path.resolve).forEach(require) : fs.readdir(__dirname, reqthese);
