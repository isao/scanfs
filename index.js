/**
 * Copyright (c) 2013 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
/*jslint node:true, sloppy:true */

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


/**
 * @param {object} err fs.stat() Error object, or null
 * @param {object} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
 * @param {string} item Pathname
 * @return {string} Name of event/type. If falsey, typer() will be used.
 */
/*jslint unparam: true*/
function typeSetter(err, stat, pathname) {
    // stub for user-provided event category typer
}

function match(str) { // because str.match doesn't work as a bare callback
    return function (re) {
        return str.match(re);
    };
}

/**
 * @param {string} item File system path.
 * @param {array} list Items remaining to fs.stat().
 * @param {object} self This instance object.
 * @return {function} Closure for fs.stat() callback.
 */
function getStatCb(item, list, self) {
    'use strict';
    /**
     * @param {string} subitem File name from fs.readdir().
     * @return {string} Filesystem path of subitem.
     */
    function pathing(subitem) {
        return path.join(item, subitem);
    }

    /**
     * Callback to add the new dir contents to the end of the stack.
     * @param {object} err From fs.readdir() failure.
     * @param {array} sublist File names contained in current item.
     */
    function recurse(err, sublist) {
        if (err) {
            self.emit('error', err, item);
        } else {
            self.relatively(list.concat(sublist.map(pathing)));
        }
    }

    /**
     * @param {object} err fs.stat() Error object, or null
     * @param {object} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
     * @param {string} item Pathname
     * @return {string} Type of filesystem item and name of event emitted
     */
    function typer(err, stat, pathname) {
        var type = 'other';
        if (err) {
            type = 'error';
        } else if (self.ignore.length && self.ignore.some(match(pathname))) {
            type = 'ignored';
        } else if (stat.isFile()) {
            type = 'file';
        } else if (stat.isDirectory()) {
            type = 'dir';
        }
        return type;
    }

    return function statCb(err, stat) {
        var type = self.typeSetter(err, stat, item) || typer(err, stat, item);

        self.emit(type, item, stat, type);

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
    this.relatively(list.map(path.resolve));
}

/**
 * @constructor
 * @param {array} ignore Array of strings or regexes for exclusion matching
 */
function Scan(ignore) {
    this.count = 0;
    this.ignore = ignore || [];
}

Scan.prototype = Object.create(Stream.prototype, {
    relatively: {value: relatively},
    absolutely: {value: absolutely},
    typeSetter: {value: typeSetter}
});

module.exports = Scan;
