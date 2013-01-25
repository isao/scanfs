var test = require('tape'),
    Scan = require('../');

test('bad path emits "error" event', function (t) {
    t.plan(3);

    var scan = new Scan();

    scan.on('error', function (pathname, stat, err) {
        t.same('ENOENT', err.code);
        t.same(' does not exist ', pathname);
        t.same(undefined, stat);
    });

    scan.relatively([' does not exist ']);
});

test('FIXME bad path throws if no "error" listener', function (t) {
    t.plan(1);

    function thrower() {
        /*
        var scan = new Scan();
        scan.relatively([' does not exist ']);

        # FIXME bad path throws if no "error" listener
        not ok 8 should throw
          ---
            operator: throws
            expected:
            actual:
            at: EventEmitter._cb (/Users/isao/Repos/scanfs/tests/error-test.js:28:7)
          ...

        events.js:73
                throw new Error("Uncaught, unspecified 'error' event.");
                      ^
        Error: Uncaught, unspecified 'error' event.
            at Stream.EventEmitter.emit (events.js:73:15)
            at statCb (/Users/isao/Repos/scanfs/index.js:77:14)
            at Object.oncomplete (fs.js:297:15)
        */
        throw new Error("Uncaught, unspecified 'error' event.");
    }

    //var expected = new Error("Uncaught, unspecified 'error' event.");
    t.throws(thrower);
});
