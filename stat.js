/**
 * Copyright (c) 2013 Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var fs = require('fs'),
    path = require('path');


/**
 * Set the type of event to fire
 * @param {object} err fs.stat() Error object, or null
 * @param {object} stat fs.Stats obj, see `man 2 stat` http://bit.ly/Sb0KRd
 * @param {string} item pathname of file, directory, socket, fifo, etc.
 * @return {string} name of event to emit
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
 * Close a string over a str.match, because str.match can't be used as a
 * functor, and using String.prototype.match.bind(str) is expensive.
 * @param {string} string to match
 * @return {function} for use as argument to ignore.some()
 */
function match(str) {
    return function(re) {
        return str.match(re);
    }
}

/**
 * @param {string} item File system path.
 * @param {array} list Items remaining to fs.stat().
 * @param {object} self This instance object.
 * @return {function} Closure for fs.stat() callback.
 */
function getStatCb(item, list, self) {
    //var self = this;

    function pathing(subitem) {
        return path.join(item, subitem);
    }

    function recurse(err, arr) {
        // TODO allow user-function here to control dir-children processing?
        process.nextTick(function nextStat() {
            self.statOne(arr ? list.concat(arr.map(pathing)) : list);
        });
    }

    function statCb(err, stat) {
        var type;

        // assign an event type
        if (err) {
            type = 'error';

        } else if (self.ignore.length && self.ignore.some(match(item))) {
            type = 'ignored';

        } else {
            type = self.typer(err, item, stat) || typer(err, item, stat);
        }

        // emit events
        self.emit(type, err, item, stat);
        self.emit('*', err, item, stat, type);

        // carry on
        if ('dir' === type) {
            process.nextTick(function childdir() {
                fs.readdir(item, recurse);
            });

        } else if (list.length) {
            recurse();

        } else {
            self.emit('done', null, self.count);
        }
    }

    return statCb;
}

module.exports = getStatCb;
