var test = require('tap').test,
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

test('bad ignores throws', function(t) {

    t.plan(2);

    t.throws(function thrower() {
        var scan = Scan(null);
    });

    t.throws(function thrower() {
        var scan = Scan({});
    });

});

