scanfs [![Build Status](https://travis-ci.org/isao/scanfs.png)](https://travis-ci.org/isao/scanfs)
======

A small library that does a breadth-first walk of the filesystem, and emits (customizable) events on the way.

install
-------

    npm i --save scanfs

example
-------

A example showing syntax (helper functions not shown):

    // instantiate with ignore patterns and a custom event function
    var Scanfs = require('scanfs'),
        scan = new Scanfs([/\/node_modules$/, '.git'], customEvents);

    // attach listeners/event handlers
    scan.on('json', handleJsonFiles)
        .on('dir', handleDirectories)
        .on('error', console.error);

    // begin scan, convert emitted pathnames to absolute
    scan.absolutely([pathA, pathB]);

A contrived but functional example including helper functions. This 1) outputs the file size of all JSON files, 2) outputs the modification dates of every directory, and 3) ignores 'node_modules', and '.git' directories. Note the `new` operator is optional, and is not used in this example.

    var Scanfs = require('scanfs');

    // add a 'json' custom event to override 'file' event for .json files
    function jsonType(pathname, stat) {
        if (stat.isFile() && pathname.match(/\.json$/)) return 'json';
    }

    // 'json' event handler to log file size
    function showSize(err, pathname, stat) {
        console.log(pathname, 'is', stat.size, 'bytes');
    }

    // 'dir' event handler to log the modification date
    function showMtime(err, pathname, stat) {
        console.log(pathname, 'was modified on', stat.mtime);
    }

    // 'done' handler
    function showCount(err, count) {
        console.log('done!', count, 'items processed.');
    }

    // instantiate with ignore patterns, and a custom event function
    Scanfs([/\/node_modules$/, '.git'], jsonType)
        .on('json', showSize)
        .on('dir', showMtime)
        .on('error', console.error)
        .relatively('.'); // begin scan, returned paths are relative

Also see [`./examples/`](./examples/).

methods
-------

Scanfs extends node's [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter), so all of it's methods are also available.

### Class Scan(ignore, typerFn)

Returns a scanfs instance. Using `new` is optional. Parameters:

* `ignore` _optional_ string, regex, or array of strings and/or regexes. The strings or regexes, if matched against the item pathname, cause the `ignored` event to get fired (instead of `file`, `dir`, etc.).
* `typerFn` _optional_ function for customizing events. See **custom events** below.

### scan.on(eventName, callback)

Attach listener callback to an event. Chainable. See **events** below.

### scan.relatively(paths)

Start scanning. Pathnames emitted to listeners are relative to the current working directory if the path arguments are also relative to the current working directory. If the path parameter(s) are absolute, then the pathnames emittted will also be absolute.

* `paths` string or array of strings, pathnames to scan recursively.

### scan.absolutely(paths)

Start scanning. Pathnames are converted to absolute with `path.resolve`.

* `paths` string or array of strings, pathnames to scan recursively.

events
------

### scan.on('file', function(err, pathname, stat) {})

The scanned item was a regular file, or a symlink to an existing file.

* `err` always null
* `pathname` string path of file
* `stat` fs.Stats object of file

### scan.on('dir', function(err, pathname, stat) {})

The scanned item was a regular directory, or a symlink to an existing directory.

* `err` always null
* `pathname` string path of file
* `stat` fs.Stats object of file

### scan.on('other', function(err, pathname, stat) {})

Item was not a directory or file; i.e. socket, tty, fifo, etc.

* `err` always null
* `pathname` string path of file
* `stat` fs.Stats object of file

### scan.on('ignored', function(err, pathname, stat) {})

Emitted for items whose pathnames to ignore, as matched by a string or regex passed as the first parameter to the constructor.

* `err` always null
* `pathname` string path of file
* `stat` fs.Stats object of file

### scan.on('error', function(err, pathname) {})

* `err` the Error object returned by fs.stat()
* `pathname` string path of file

### scan.on('*', function(err, pathname, stat, type) {})

A wildcard event, emitted for every event type except `done`.

* `err` null, or the Error object returned by fs.stat()
* `pathname` string path of file
* `stat` fs.Stats object of file
* `type` string event name

### scan.on('done', function(err, count) { })

Signals file system scanning is complete.

* `err` always null
* `count` total number of filesystem items scanned

custom events
-------------

You can assign a custom event categorization function to `Scan.typer`, or pass it as the second parameter to the constructor. The categorization function is called for every non-error filesystem item, with the following two parameters:

* `pathname` a string pathname of the item scanned
* `stat` an `fs.Stats` object for the item scanned (see <http://bit.ly/Sb0KRd> or `man 2 stat` for more information about stat's properties)

If the categorization function returns a falsey value, then the default event is emitted. Otherwise, the return value is used as the event name.

Note that if the original event name was changed from `dir` to something else, then `scanfs` will not scan the associated directory.

limitations
-----------

Uses `fs.stat()` so symlinks are followed and cycles (like a symlink to itself) are not detected.

test
----

    npm test

license
-------
MIT
