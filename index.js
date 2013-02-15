/**
 * Copyright (c) 2013 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
/*jshint node:true */
'use strict';

// TODO
// - allow emitted filenames to have head parts chopped off

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
        self.count += 1;
        fs.stat(item, getStatCb(item, list, self));
    }
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

    /**
     * @param {object} err fs.stat() Error object, or null
     * @param {object} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
     * @param {string} item Pathname
     * @return {string} Type of filesystem item and name of event emitted
     */
    function typer(err, pathname, stat) {
        var type = 'other';
        if (err) {
            type = 'error';
        } else if (self.ignore.some(matchCb(pathname))) {
            type = 'ignored';
        } else if (stat.isFile()) {
            type = 'file';
        } else if (stat.isDirectory()) {
            type = 'dir';
        }
        return type;
    }

    return function statCb(err, stat) {
        var type = self.typeSetter(err, item, stat) || typer(err, item, stat);

        self.emit(type, item, stat, err);

        if ('error' !== type) {
            self.emit('*', item, stat, type);
        }

        if ('dir' === type) {
            fs.readdir(item, recurse);
        } else if (list.length) {
            self.relatively(list);
        } else {
            self.emit('done', self.count);
        }
    };
}

function matchCb(str) {
    return function (re) {
        return str.match(re);
    };
}

function arrayify(input) {
    if('string' === typeof input) {
        input = [input];
    } else if(!(input instanceof Array) && (undefined !== input)) {
        throw new TypeError('arguments must be either strings or arrays');
    }
    return input || [];
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

/**
 * Inherit from core streams module to get emit()/on(), additional stream-iness
 * not used yet. Could use EventEmitter...
 */
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
    statOne(arrayify(list).map(path.resolve), this);
};

/**
 * @param {object} err fs.stat() Error object, or null
 * @param {object} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
 * @param {string} item Pathname
 * @return {string} Name of event/type. If falsey, typer() will be used.
 */
Scan.prototype.typeSetter = function typeSetter(err, stat, pathname) {
    // stub for user-provided event category typer
};

module.exports = Scan;
