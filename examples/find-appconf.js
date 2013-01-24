#!/usr/bin/env node

var ignore = [/\/node_modules/, /\/.git/],
    configs = [],

    Scan = require('../'),
    scan = new Scan(ignore);


// add a custom event
scan.typeSetter = function (err, stat, pathname) {
    if (pathname.match('application.json')) {
        return 'appconfig';
    }
};

// listen for it
scan.on('appconfig', function(meta) {
    configs.push(meta.pathname);
});

// default event types include 'error', '*', 'file', 'dir', 'other', 'ignored'
scan.on('file', function(meta) {
    process.stdout.write('.');
});

// results
scan.on('done', function (count) {
    console.log('\nscanned %d things', count);
    console.log('found these configs:\n ', configs.join('\n  '));
});

// pass path(s) as command line arguments
scan.relatively(process.argv.slice(2));