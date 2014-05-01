var test = require('tape'),
    EventEmitter = require('events').EventEmitter,
    Scan = require('../');


test('/dev/null emits "other" and isCharacterDevice()', function(t) {
    var scan = new Scan();

    scan.on('other', function(err, pathname, stat) {
        t.equal(pathname, '/dev/null');
        t.ok(stat.isCharacterDevice());
    });

    t.plan(2);
    scan.absolutely('/dev/null');
});

test('can omit "new"', function(t) {
    var scan = Scan();

    t.ok(scan instanceof Scan);
    t.ok(scan instanceof EventEmitter);
    t.end();
});
