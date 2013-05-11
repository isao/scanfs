var path = require('path'),
    test = require('tap').test,
    Scan = require('../'),
    ignore = [/node_modules/, /\.git/],
    from = path.dirname(__dirname);


test('done count equals files + dirs + ignored', function (t) {
    t.plan(1);

    var scan = new Scan(ignore),
        items = 0;

    function inc(err, pathname, stat) {
        items++;
    }

    scan.on('dir', inc);
    scan.on('file', inc);
    scan.on('other', inc);
    scan.on('ignored', inc);
    scan.on('done', function (err, count) {
        t.equal(count, items);
    });

    scan.relatively([from]);
});

test('ignore one', function (t) {
    t.plan(1);

    var scan = new Scan('counts.js'),
        ignored = 0;

    scan.on('ignored', function (err, pathname, stat) {
        ignored++;
    });

    scan.on('done', function (err, count) {
        t.equal(ignored, 1);
    });

    scan.relatively(__dirname);
});

test('ignore two', function (t) {
    t.plan(1);

    var scan = new Scan(['counts.js', 'errors.js']),
        ignored = 0;

    scan.on('ignored', function (err, pathname, stat) {
        ignored++;
    });

    scan.on('done', function (err, count) {
        t.equal(ignored, 2);
    });

    scan.relatively(__dirname);
});

test('counts same for scan.absolutely()', function (t) {
    t.plan(1);

    var scan = new Scan(ignore),
        count = 0;

    scan.on('*', function (err, pathname, stat) {
        count++;
    });

    scan.on('done', function (err, done_count) {
        t.equal(count, done_count);
    });

    scan.absolutely([from]);
});
