var test = require('tape'),
    Scan = require('../');

test('file not found emits "error" event', function (t) {
    t.plan(3);

    var scan = new Scan();

    scan.on('error', function (pathname, stat, err) {
    	t.same('ENOENT', err.code);
    	t.same(' does not exist ', pathname);
    	t.same(undefined, stat);
    });

    scan.relatively([' does not exist ']);
});
