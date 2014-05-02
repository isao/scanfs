'use strict';

var fs = require('fs'),
    path = require('path'),
    EventEmitterPrototype = require('events').EventEmitter.prototype;


// helper functions //

function typer(pathname, stat) {
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
 * @param {function} typer Function that returns a event name string, or falsey
 * @events 'file', 'dir', 'other', 'ignored', '*', 'error', 'done'; or whatever
 * may be returned by (this.typer() || typer()).
 */
function Scan(ignore, typer) {
    if (!(this instanceof Scan)) {
        return new Scan(ignore, typer); // instantiate without "new"
    }
    this.count = 0;
    this.ignore = arrayify(ignore);
    if ('function' === typeof typer) {
        this.typer = typer;
    }
}

Scan.prototype = Object.create(EventEmitterPrototype, {
    constructor: {
        value: Scan,
        enumerable: false,
        writable: true,
        configurable: true
    }
});


/**
 * @param {array} queue Pathname(s) to scan.
 */
Scan.prototype.relatively = function(queue) {
    this.stat(arrayify(queue));
};

/**
 * @param {array} queue Pathname(s) to covert to absolute, then scan.
 */
Scan.prototype.absolutely = function(queue) {
    this.stat(arrayify(queue).map(resolve));
};

/**
 * @param {string} item Pathname
 * @param {fs.Stats} stat fs.Stats object, see `man 2 stat`, http://bit.ly/Sb0KRd
 * @return {string} type of event to emit. If falsey, typer() will be used.
 */
Scan.prototype.typer = function(item, stat) {
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
        type = this.typer(item, stat) || typer(item, stat);
    }
    return type;
};

/**
 * Stub for short-circuiting recusion based on the contents of a directory.
 * @param {string} dir Parent directory of the prospective items to enqueue
 * @param {array} contents Array of strings of the basename contents of dir
 * @return {array|null}
 */
Scan.prototype.beforeEnqueue = function(dir, contents) {
    /*jshint unused:false */
};

/**
 * @param {array} queue Queue of pathnames to fs.stat().
 */
Scan.prototype.stat = function(queue) {
    var self = this,
        item = queue.shift();

    function readdirCb(err, arr) {
        var enqueue;

        if (err) { // i.e. EACCES
            self.emit('error', err, item);
        } else { // enqueue dir contents
            enqueue = self.beforeEnqueue(item, arr) || arr;
            queue.push.apply(queue, enqueue.map(prefix(item + path.sep)));
        }

        self.stat(queue);
    }

    function statCb(err, stat) {
        var type = self.getType(err, item, stat);

        self.emit(type, err, item, stat);
        self.emit('*', err, item, stat, type);

        if ('dir' === type) {
            fs.readdir(item, readdirCb);
        } else if (queue.length) {
            self.stat(queue);
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
