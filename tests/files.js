var path = require('path'),
    test = require('tap').test,
    Scan = require('../'),
    ignore = [/node_modules/, /\.git/],
    from = path.dirname(__dirname);

test('find package.json', function (t) {
    t.plan(1);
    var scan = new Scan(ignore);

    scan.on('file', function (err, pathname, stat) {
        if (pathname.match('package.json')) {
            t.equal('Isao Yagi <isao@yahoo-inc.com>', require(pathname).author);
        }
    });

    scan.relatively(from);
});

test('verify params', function (t) {
    var scan = new Scan(ignore);

    scan.on('*', function (err, pathname, stat, type) {
        t.same(err, null);
        t.same(typeof pathname, 'string');
        t.same(typeof stat, 'object');
        t.same(typeof type, 'string');
        t.same(typeof stat.constructor, 'function');
    });

    scan.on('file', function (err, pathname, stat) {
        t.same(err, null);
        t.same(typeof pathname, 'string');
        t.same(typeof stat, 'object');
        t.same(typeof stat.constructor, 'function');
        t.true(stat.isFile(), 'it is file');
        t.false(stat.isDirectory(), 'it is not dir');
    });

    scan.on('dir', function (err, pathname, stat) {
        t.same(err, null);
        t.same(typeof pathname, 'string');
        t.same(typeof stat, 'object');
        t.same(typeof stat.constructor, 'function');
        t.false(stat.isFile(), 'it is not a file');
        t.true(stat.isDirectory(), 'it is dir');
    });

    scan.on('done', function(err, count) {
        t.same(err, null);
        t.same(typeof count, 'number');
        t.end();
    })

    scan.relatively(__dirname);
});
