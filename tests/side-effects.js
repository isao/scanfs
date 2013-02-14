var path = require('path'),
    test = require('tape'),
    Scan = require('../');

//todo: fix
test('array passed to relatively/absolutely is emptied', function(t) {
    var scan = new Scan([]),
        dirs = [__dirname];

    t.plan(2);
    t.equal(dirs.length, 1);
    scan.relatively(dirs);
    t.equal(dirs.length, 0);
});
