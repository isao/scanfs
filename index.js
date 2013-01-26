/**
 * Copyright (c) 2013 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
/*jshint node:true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


/**
 * helper function since String#match can't be used as a bare callback
 * @param {string}
 * @return {function}
 */
function match(str) {
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
        self.relatively(list.concat(sublist.map(pathing)));
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

/**
 * @constructor
 * @param {array} ignore Array of strings or regexes for exclusion matching
 *
 * @Event {file}    -> {string} pathname, {fs.Stat} stat obj, {error} error obj
 * @Event {dir}     -> {string} pathname, {fs.Stat} stat obj, {error} error obj
 * @Event {other}   -> {string} pathname, {fs.Stat} stat obj, {error} error obj
 * @Event {ignored} -> {string} pathname, {fs.Stat} stat obj, {error} error obj
 *
 * @Event {error}   -> {string} pathname, {error} error obj
 * @Event {done}    -> {integer} count of non-error items, a cumulative total
 */
function Scan(ignore) {
    this.count = 0;
    this.ignore = ignore || [];
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
Scan.prototype.relatively = function relatively(list) {
    var item = list.shift();
    if (item) {
        this.count += 1;
        fs.stat(item, getStatCb(item, list, this));
    }
};

/**
 * @param {array} list Paths to begin walking. Events emitted for every item.
 * Pathnames emitted are absolute.
 */
Scan.prototype.absolutely = function absolutely(list) {
    this.relatively(list.map(path.resolve));
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
