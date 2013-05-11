#!/usr/bin/env node

// find all *.js files in dir(s) passed as command line args

var ignore = ['node_modules', /\/.(git|svn)/],
    found = [],

    Scan = require('../'),
    scan = new Scan(ignore),

    args = process.argv.slice(2),
    dirs = args.length ? args : ['.'];


// add a custom event
scan.typer = function (err, pathname, stat) {
    if (pathname.match(/\.js$/)) {
        return 'javascript!';
    }
};

// listen for it
scan.on('javascript!', function (err, pathname, stat) {
    found.push(pathname);
});

// default event types include 'error', '*', 'file', 'dir', 'other', 'ignored'
scan.on('file', function (err, pathname, stat) {
    // .js files no longer fire a 'file' event, but they still fire '*'
    process.stdout.write('.');
});

scan.on('error', console.error);

// results
scan.on('done', function (err, count) {
    console.log('\nscanned %d things', count);
    console.log('found these js files:\n ', found.join('\n  '));
});

// pass path(s) as command line arguments
scan.relatively(dirs);
