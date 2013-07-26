var path = require('path'),
    test = require('tap').test,
    Scan = require('../');


test('array passed to relatively/absolutely is NOT modified', function(t) {
    var scan = new Scan([]),
        dirs = [__dirname];

    t.plan(2);
    t.equal(dirs.length, 1);
    scan.relatively(dirs);
    t.equal(dirs.length, 1);
});


test('array passed to constructor is NOT modified', function(t) {
    var ignore = ['abc', 'def'],
        scan = new Scan(ignore),
        dirs = [__dirname];

    t.plan(3);
    t.equal(dirs.length, 1);
    scan.relatively(dirs);
    t.equal(dirs.length, 1);
    t.same(ignore, ['abc', 'def']);
});

test('Scan can be instantiated without "new"', function(t) {
	t.plan(2);
	t.ok(Scan() instanceof Scan);
	t.ok(require('../')() instanceof Scan);
});
