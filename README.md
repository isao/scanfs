scanfs [![Build Status](https://travis-ci.org/isao/scanfs.png)](https://travis-ci.org/isao/scanfs)
======

A small library that does a breadth-first walk of the filesystem, and emits (customizable) events on the way.

install
-------

    npm i --save scanfs

example
-------

Display the last modification dates of every file from the current working directory, excluding 'node_modules', and '.git':

    var ignore = [/^node_modules$/, '.git'],
        Scan = require('scanfs'),
        scan = new Scan(ignore);

    scan.on('file', function(err, pathname, stat) {
        console.log('%s, was modified on %s', pathname, stat.mtime);
    });

    scan.relatively('.');

You can also skip the "new" operator:

    var scan = require('scanfs')(ignore, myTyperFn);

Also see [`./examples/`](./examples/).

methods
-------

### class Scan(ignored, typerFn)

Parameters:

* `ignored` _optional_ string, regex, or array of strings and/or regexs. The strings or regexes, if matched against the item pathname, cause the `ignored` event to get fired (instead of "file", "dir", etc.).
* `typerFn` _optional_ function for customizing events. See **customizing events** below.

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

You can assign a custom event categorization function to `Scan.typer`, or pass it as the second parameter to the constructor. The function is called for every non-error filesystem item, with the following two parameters:

    * `pathname` a string pathname of the item scanned
    * `stat` an `fs.Stats` object for the item scanned (see <http://bit.ly/Sb0KRd> or `man 2 stat`)

If the function returns a falsey value, then the default event is emitted. Otherwise, the return value is used as the event name.

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
