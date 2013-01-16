#!/usr/bin/env node
'use strict';

var Scan = require('./'),
    scan = new Scan(),
    args = process.argv.slice(2);

scan.on('**', function(meta) {
    console.log(meta.type, '\t', meta.pathname);
});

scan.relatively(args.length ? args : ['.']);
