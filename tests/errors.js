var test = require('tape'),
    Scan = require('../');


test('bad path emits "error" event', function (t) {
    t.plan(3);

    var scan = new Scan();

    scan.on('error', function (err, pathname, stat) {
        t.same('ENOENT', err.code);
        t.same(' does not exist ', pathname);
        t.same(undefined, stat);
    });

    scan.relatively([' does not exist ']);
});

test('scan.relatively() emits "done", does nothing else', function (t) {
    t.plan(2);

    var scan = new Scan(),
        count;

    scan.on('*', function(err, item, stat, type) {
        count++;
    });

    scan.on('done', function (err, actual) {
        t.same(actual, 0);
        t.same(count, undefined);
    });

    scan.relatively();
});

test('scan.relatively([]) emits "done", does nothing else', function (t) {
    t.plan(2);

    var scan = new Scan(),
        count;

    scan.on('*', function(err, item, stat, type) {
        count++;
    });

    scan.on('done', function (err, actual) {
        t.same(actual, 0);
        t.same(count, undefined);
    });

    scan.relatively([]);
});

test('statOne w/ empty array', function (t) {
    t.plan(2);

    var scan = new Scan(),
        count;

    scan.on('*', function(err, item, stat, type) {
        count++;
    });

    scan.on('done', function (err, actual) {
        t.equal(actual, 0);
        t.same(count, undefined);
    });

    scan.stat([]);
});

test('insufficient priveleges emits error event', function (t) {
    t.plan(3);

    var scan = new Scan();

    scan.on('error', function (err, pathname, stat) {
        t.same(undefined, stat);
        if ('EACCES' === err.code) {
            // ONE of the dirs will exist and trigger this
            t.same('EACCES', err.code);
        }
    });

    scan.relatively(['/root' /*linux*/, '/.Trashes' /*osx*/]);
});
