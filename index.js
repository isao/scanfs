/*jslint sloppy:true node:true */

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


function Scan() {
}

function relative(f) {
    var self = this;

    function onStat(err, stat) {
        var type;
        if (err) {
            type = 'error';

        } else if (stat.isFile()) {
            type = 'file';

        } else if (stat.isDirectory()) {
            type = 'directory';
            fs.readdir(f, function onReaddir(err, files) {
                if (err) {
                    self.emit('error', err);
                }
                (files || []).forEach(function per(file) {
                    self.relative(path.join(f, file));
                });
            });

        } else {
            type = 'other';
        }

        this.emit(type, {file: f, type: type, stat: stat, error: err});
    }

    fs.stat(f, onStat.bind(self));
}

function absolute(f) {
    return relative(path.resolve(f));
}

Scan.prototype = Object.create(Stream.prototype);
Scan.prototype.relative = relative;
Scan.prototype.absolute = absolute;

module.exports = Scan;
