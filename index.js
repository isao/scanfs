/*jslint sloppy:true node:true */

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


function Scan() {
}

function relative(f) {
    var self = this;

    function recurse(file) {
        self.relative(path.join(f, file));
    }

    function perdir(err, files) {
        return err ? self.emit('error', err) : files.forEach(recurse);
    }

    function onStat(err, stat) {
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

    fs.stat(f, onStat);
}

function absolute(f) {
    return relative(path.resolve(f));
}

Scan.prototype = Object.create(Stream.prototype);
Scan.prototype.relative = relative;
Scan.prototype.absolute = absolute;

module.exports = Scan;
