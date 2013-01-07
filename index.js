/*jslint node:true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


//todo:
//- callback
//- file/type exclusion
//- make event type categorization user configurable/parameterized

function Scan() {}

Scan.prototype = Object.create(Stream.prototype);

Scan.prototype.relative = function (f) {
    var self = this;

    function recurse(file) {
        self.relative(path.join(f, file));
    }

    function perdir(err, files) {
        return err ? self.emit('error', err) : files.forEach(recurse);
    }

    function statCb(err, stat) {
        var type = 'other';
        if (err) {
            type = 'error';
        } else if (stat.isFile()) {
            type = 'file';
        } else if (stat.isDirectory()) {
            type = 'directory';
            fs.readdir(f, perdir);
        }
        self.emit(type, {file: f, type: type, stat: stat, error: err});
    }

    fs.stat(f, statCb);
};

Scan.prototype.absolute = function (f) {
    return this.relative(path.resolve(f));
};

module.exports = Scan;
