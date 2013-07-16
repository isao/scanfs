/**
 * Copyright (c) 2013 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    statter = require('./stat.js');


function arrayify(arg) {
    return [].concat(arg).filter(function isDefined(item) {
        /*jshint eqnull:true */
        return item != null;
    });
}

/**
 * @constructor
 * @param {array} ignore Array of strings or regexes for exclusion matching
 * @param {function} fn Function that returns a event name string, or falsey
 * @events file, dir, other, ignored, *, error
 */
function Scan(ignore, fn) {
    this.count = 0;
    this.ignore = arrayify(ignore);
    if ('function' === typeof fn) {
        this.typer = fn;
    }
}

Scan.prototype = Object.create(EventEmitter.prototype);

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are relative to the pathnames in the list.
 */
Scan.prototype.relatively = function(list) {
    this.statOne(arrayify(list));
};

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are absolute.
 */
Scan.prototype.absolutely = function(list) {
    function resolve(pathname) {
        return path.resolve(pathname); // pass only 1st arg of map to resolve()
    }
    this.statOne(arrayify(list).map(resolve));
};

/**
 * @param {array} list Items remaining to fs.stat().
 * @param {object} self This instance object.
 */
Scan.prototype.statOne = function(list) {
    var item = list.shift();
    if (item) {
        this.count++;
        fs.stat(item, statter(item, list, this));
    } else {
        this.emit('done', null, this.count);
    }
};

/**
 * @param {object|null} err fs.stat() Error object, or null
 * @param {string} item Pathname
 * @param {object} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
 * @return {string} Name of event/type. If falsey, typer() will be used.
 */
Scan.prototype.typer = function(err, item, stat) {
    /*jshint unused:false */
    // stub for user-provided event category typer
};

module.exports = Scan;
