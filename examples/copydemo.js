#!/usr/bin/env node

// copy all .js files from this repo's base dir to /tmp/copydemo

var fs = require('fs'),
    path = require('path'),

    ignore = ['.git', 'node_modules'],
    to = '/tmp/copydemo/',

    Scan = require('../'),
    scan = new Scan(ignore);


scan.on('dir', function (err, pathname, stat) {
    fs.mkdir(path.join(to, pathname));
});

scan.on('file', function (err, pathname, stat) {
    var dest = to + pathname;
    if (pathname.match(/\.js$/)) {
        console.log('copying %s to %s', pathname, dest);
        fs.createReadStream(pathname).pipe(fs.createWriteStream(dest));
    }
});

scan.on('error', console.error);

scan.on('done', function (err, count) {
    console.log('done. %d things scanned. files copied to %s', count, to);
});

process.chdir(path.dirname(__dirname))
scan.relatively(['.']);
