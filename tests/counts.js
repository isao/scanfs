var path = require('path'),
    test = require('tape'),

    Scan = require('../'),

    ignore = [/\/node_modules/, /\/.git/],
    from = path.dirname(__dirname);


test('done count equals files + dirs', function (t) {
    t.plan(1);

    var scan = new Scan(),
        files = 0,
        dirs = 0;

    scan.on('file', function (pathname, stat, type) {
        files++;
    });

    scan.on('dir', function (pathname, stat, type) {
        dirs++;
    });

    scan.on('done', function (count) {
        t.equal(count, files + dirs);
    });

    scan.relatively([from]);
});

test('find package.json', function (t) {
    t.plan(1);

    var scan = new Scan(ignore);

    scan.on('file', function (pathname, stat, type) {
        if (pathname.match('package.json')) {
            t.equal('Isao Yagi <isao@yahoo-inc.com>', require(pathname).author);
        }
    });

    scan.relatively([from]);
});

test('"*" count equals done count', function (t) {
    t.plan(1);

    var scan = new Scan(ignore),
        count = 0;

    scan.on('*', function (pathname, stat, type) {
        count++;
    });

    scan.on('done', function (done_count) {
        t.equal(count, done_count);
    });

    scan.relatively([from]);
});

test('counts same for scan.absolutely()', function (t) {
    t.plan(1);

    var scan = new Scan(ignore),
        count = 0;

    scan.on('*', function (pathname, stat, type) {
        count++;
    });

    scan.on('done', function (done_count) {
        t.equal(count, done_count);
    });

    scan.absolutely([from]);
});