#!/usr/bin/env node
'use strict';

var Scan = require('./'),
    scan = new Scan(),
    args = process.argv.slice(2);

scan.on('*', function(meta) {
    console.log(meta.type, '\t', meta.pathname);
}).on('done', function(count) {
	console.log('done. %d items.', count);
}).on('error', function(err, pathname) {
	console.error('uh oh. error %j for %s', err, pathname);
});

scan.relatively(args.length ? args : ['.']);
