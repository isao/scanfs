var path = require('path'),
    test = require('tap').test,
    Scan = require('../'),
    ignore = [/node_modules/, /\.git/],
    from = path.dirname(__dirname);


test('done count equals files + dirs + ignored', function (t) {
    t.plan(1);

    var scan = new Scan(ignore),
        items = 0;

    scan.on('file', function (err, pathname, stat) {
        items++;
    });

    scan.on('dir', function (err, pathname, stat) {
        items++;
    });

    scan.on('ignored', function (err, pathname, stat) {
        items++;
    });

    scan.on('done', function (count) {
        t.equal(count, items);
    });

    scan.relatively([from]);
});

test('ignore one works', function (t) {
    t.plan(1);

    var scan = new Scan('counts.js'),
        files = 0;

    scan.on('file', function (err, pathname, stat) {
        files++;
    });

    scan.on('done', function (count) {
        t.equal(files, count - 2);
    });

    scan.relatively(__dirname);
});

test('ignore a couple works', function (t) {
    t.plan(1);

    var scan = new Scan(['counts.js', 'errors.js']),
        files = 0;

    scan.on('file', function (err, pathname, stat) {
        files++;
    });

    scan.on('done', function (count) {
        t.equal(files, count - 3);
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

    scan.on('done', function (done_count) {
        t.equal(count, done_count);
    });

    scan.absolutely([from]);
});

test('statOne noop', function (t) {
    t.plan(1);

    var scan = new Scan(ignore);
    t.same(scan.statOne([]), undefined);
});
