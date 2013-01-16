/*jslint node:true, sloppy:true */

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


/**
 * @param {object} err fs.stat() Error object, or null
 * @param {object} stat fs.Stats object http://nodejs.org/docs/latest/api/fs.html#fs_class_fs_stats
 * @param {string} item Pathname
 * @return {string} Type of filesystem item and name of event emitted
 */
function typer(err, stat) {
    'use strict';
    var type = 'other';
    if (err) {
        type = 'error';
    } else if (stat.isFile()) {
        type = 'file';
    } else if (stat.isDirectory()) {
        type = 'dir';
    }
    return type;
}

/**
 * @param {string} item File system path.
 * @param {array} list Items remaining to fs.stat().
 * @param {object} self This instance object.
 */
function getStatCb(item, list, self) {
    'use strict';
    return function statCb(err, stat) {
        var type = self.typeset(err, stat, item) || typer(err, stat);

        //self.emit(type, {type: type, filepath: item, stat: stat, error: err});
        self.emit('*', {type: type, filepath: item, stat: stat, error: err});

        /**
         * @param {string} subitem File name from fs.readdir().
         * @return {string} Filesystem path of subitem.
         */
        function pathing(subitem) {
            return path.join(item, subitem);
        }

        /**
         * @param {object} err
         * @param {array} sublist File names contained in current item
         */
        function recurse(err, sublist) {
            self.relatively(list.concat(sublist.map(pathing)));
        }

        if ('dir' === type) {
            fs.readdir(item, recurse);
        } else if (list.length) {
            self.relatively(list);
        } else {
            self.emit('*', {type: 'done', filepath: self.count});
        }
    };
}

/**
 * @param {function} fn Function to allow custom event categories/types. The
 * function will be passed err, stat, and pathname. If fn doesn't return a
 * truthy value, the default typer will be used.
 */
function typeSetter(fn) {
    if ('function' === typeof fn) {
        this.typeset = (function () {
            'use strict';
            return fn;
        }());
    } else {
        this.typeset = function () {};
    }
}

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are relative to the pathnames in the list.
 */
function relatively(list) {
    var item = list.shift();
    if (item) {
        this.count += 1;
        fs.stat(item, getStatCb(item, list, this));
    }
}

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are absolute.
 */
function absolutely(list) {
    return this.relatively(list.map(path.resolve));
}

function Scan() {
    this.count = 0;
    this.typeSetter();
}

Scan.prototype = Object.create(Stream.prototype, {
    relatively: {value: relatively},
    absolutely: {value: absolutely},
    typeSetter: {value: typeSetter}
});

module.exports = Scan;
