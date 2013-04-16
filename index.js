/**
 * Copyright (c) 2013 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


/**
 * @param {array} list Items remaining to fs.stat().
 * @param {object} self This instance object.
 */
function statOne(list, self) {
    var item = list.shift();
    if (item) {
        self.count++;
        fs.stat(item, getStatCb(item, list, self));
    }
}

/**
 * @param {object} err fs.stat() Error object, or null
 * @param {object} stat fs.Stats obj, see `man 2 stat` http://bit.ly/Sb0KRd
 * @param {string} item Pathname
 * @return {string} Type of filesystem item and name of event emitted
 */
function typer(err, pathname, stat) {
    var type = 'other';
    if (stat.isFile()) {
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
 * @return {function} Closure for fs.stat() callback.
 */
function getStatCb(item, list, self) {

    function pathing(subitem) {
        return path.join(item, subitem);
    }

    function recurse(err, sublist) {
        process.nextTick(function() {
            statOne(list.concat(sublist.map(pathing)), self);
        });
    }

    return function statCb(err, stat) {
        var type;

        if (err) {
            type = 'error';
        } else if (self.ignore.some(String.prototype.match.bind(item))) {
            type = 'ignored';
        } else {
            type = self.typeSetter(err, item, stat) || typer(err, item, stat);
        }

        self.emit(type, err, item, stat);
        self.emit('*', err, item, stat, type);

        if ('dir' === type) {
            fs.readdir(item, recurse);
        } else if (list.length) {
            statOne(list, self);
        } else {
            self.emit('done', self.count);
        }
    };
}

function arrayify(input) {
    var arr;
    if(undefined === input) {
        arr = [];
    } else if(('string' === typeof input) || (input instanceof RegExp)) {
        arr = [input];
    } else if(!(input instanceof Array)) {
        throw new TypeError('arguments must be either strings or arrays');
    } else {
        arr = input.slice();
    }
    return arr;
}

/**
 * @constructor
 * @param {array} ignore Array of strings or regexes for exclusion matching
 * @events file, dir, other, ignored, *, error
 */
function Scan(ignore) {
    this.count = 0;
    this.ignore = arrayify(ignore);
}

Scan.prototype = Object.create(Stream.prototype);

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are relative to the pathnames in the list.
 */
Scan.prototype.relatively = function(list) {
    statOne(arrayify(list), this);
};

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are absolute.
 */
Scan.prototype.absolutely = function(list) {
    function resolve(pathname) {
        return path.resolve(pathname); // pass only 1st arg of map to resolve()
    }
    statOne(arrayify(list).map(resolve), this);
};

/**
 * @param {object|null} err fs.stat() Error object, or null
 * @param {string} item Pathname
 * @param {object} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
 * @return {string} Name of event/type. If falsey, typer() will be used.
 */
Scan.prototype.typeSetter = function(err, item, stat) {
    // stub for user-provided event category typer
};

module.exports = Scan;
