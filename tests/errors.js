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

test('generic thow tests', function (t) {
    t.plan(2);
    var expected = new Error("Uncaught, unspecified 'error' event.");

    function thrower1() { throw expected; }
    t.throws(thrower1, expected);

    function thrower2() { throw new Error("Uncaught, unspecified 'error' event."); }
    t.throws(thrower2, expected);
});

test('no "error" listener should throw', {skip:true}, function (t) {
    t.plan(1);
    function thrower() {
        var scan = new Scan();
        scan.relatively(['nonesuch']);
    }
    t.throws(thrower);

    //
    // not ok 6 should throw
    //   ---
    //     operator: throws
    //     expected:
    //     actual:
    //     at: EventEmitter._cb (/Users/isao/Repos/proj/scanfs/tests/error-test.js:57:7)
    //   ...
    //
});
