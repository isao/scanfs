#!/usr/bin/env node
/**
 * Copyright (c) 2012 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
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
