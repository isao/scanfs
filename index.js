/**
 * Copyright (c) 2013 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


// helper functions

function typer(err, pathname, stat) {
    var type = 'other';
    if (stat.isFile()) {
        type = 'file';
    } else if (stat.isDirectory()) {
        type = 'dir';
    }
    return type;
}

function match(str) {
    return function(re) { return str.match(re); };
}

function prefix(left) {
    return function(right) { return left + right; };
}

function resolve(pathname) {
    return path.resolve(pathname);
}

function isDefined(item) {
    /*jshint eqnull:true */
    return item != null;
}

function arrayify(arg) {
    return [].concat(arg).filter(isDefined);
}


/**
 * @extends EventEmitter
 * @param {array} ignore Array of strings or regexes for exclusion matching
 * @param {function} fn Function that returns a event name string, or falsey
 * @events 'file', 'dir', 'other', 'ignored', '*', 'error', 'done'; or custom
 */
function Scan(ignore, fn) { // todo make "new" optional
    this.count = 0;
    this.ignore = arrayify(ignore);
    if ('function' === typeof fn) {
        this.typer = fn;
    }
}

Scan.prototype = Object.create(Stream.prototype);

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are relative to the pathnames in the list.
 */
Scan.prototype.relatively = function(list) {
    this.stat(arrayify(list));
};

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are absolute.
 */
Scan.prototype.absolutely = function(list) {
    this.stat(arrayify(list).map(resolve));
};

/**
 * @param {object|null} err fs.stat() Error object, or null
 * @param {string} item Pathname
 * @param {fs.Stats} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
 * @return {string} type of event to emit. If falsey, typer() will be used.
 */
Scan.prototype.typer = function(err, item, stat) {
    /*jshint unused:false *//* stub for user-provided event typer */
};

/**
 * @param {Error|null} err fs.stat error
 * @param {string} item pathname of filesystem item
 * @param {fs.Stats} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
 * @return {string} type of event to emit
 */
Scan.prototype.getType = function(err, item, stat) {
    var type;
    if (err) {
        type = 'error';
    } else if (this.ignore.length && this.ignore.some(match(item))) {
        type = 'ignored';
    } else {
        type = this.typer(err, item, stat) || typer(err, item, stat);
    }
    return type;
};

/**
 * @param {array} list Queue of pathnames to fs.stat().
 */
Scan.prototype.stat = function(list) {
    var self = this,
        item = list.shift();

    function readdirCb(err, arr) {
        self.stat(list.concat(arr.map(prefix(item + path.sep))));
    }

    function statCb(err, stat) {
        var type = self.getType(err, item, stat);
        self.emit(type, err, item, stat);
        self.emit('*', err, item, stat, type);

        if ('dir' === type) {
            fs.readdir(item, readdirCb);
        } else if (list.length) {
            self.stat(list);
        } else {
            self.emit('done', null, self.count);
        }
    }

    if (item) {
        this.count++;
        fs.stat(item, statCb);
    } else {
        this.emit('done', null, this.count);
    }
};

module.exports = Scan;
