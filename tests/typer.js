var test = require('tap').test,
    path = require('path'),

    Scan = require('../'),
    balls = path.resolve(__dirname, 'fixtures', 'balls');


test('typer emit if basename contains an "i"', function(t) {
    var scan,
        items = 0,
        has_i = 0;

    function hasAnI(err, item, stat) {
        if (!err && stat.isFile()) {
            return (path.basename(item).indexOf('i') !== -1) && 'has_i';
        }
    }

    scan = new Scan(null, hasAnI);
    scan.on('*', function inc(err, pathname, stat) {
        items++;
    });

    scan.on('has_i', function inc(err, pathname, stat) {
        t.ok(pathname.match(/(whiffle|billiard)$/));
        has_i++;
    });

    scan.on('done', function(err, total) {
        t.equal(has_i, 2);
        t.equal(total, items);
    });

    t.plan(4);
    scan.relatively(balls);
});
