#!/usr/bin/env node

// copy all .js files from parent dir to /tmp/copytest

var fs = require('fs'),
    path = require('path'),

    ignore = ['.git', 'node_modules'],
    from = path.dirname(__dirname),
    to = '/tmp/copytest/',

    Scan = require('../'),
    scan = new Scan(ignore);


scan.on('dir', function (meta) {
    fs.mkdir(path.join(to, meta.pathname));
});

scan.on('file', function(meta) {
    var dest = to + meta.pathname;
    if (meta.pathname.match(/\.js$/)) {
        console.log('copying %s to %s', meta.pathname, dest);
        fs.createReadStream(meta.pathname).pipe(fs.createWriteStream(dest));
    }
});

scan.on('error', console.error);

scan.on('done', function (count) {
    console.log('done. %d things scanned. files copied to %s', count, to);
});

process.chdir(path.dirname(__dirname))
scan.relatively(['.']);
