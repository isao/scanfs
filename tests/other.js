var test = require('tap').test,
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
