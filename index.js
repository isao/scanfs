#!/usr/bin/env node
'use strict';

var fs = require('graceful-fs'),
    path = require('path'),
    Event = require('events').EventEmitter;


function fscan(f, ee) {
    function onStat(err, stat) {
        var type;

        if (err) {
            type = 'error';

        } else if (stat.isFile()) {
            type = 'file';

        } else if (stat.isDirectory()) {
            type = 'directory';
            fs.readdir(f, function onReaddir(err, files) {
                (files || []).forEach(function per(file) {
                    fscan(path.join(f, file), ee);
                });
            });

        } else {
            type = 'other';
        }

        ee.emit(type, {file: f, type: type, stat: stat, error: err});
    }

    fs.stat(f, onStat);
}

module.exports = fscan;

module.exports.fullpaths = function (f, ee) {
    fscan(path.resolve(f), ee);
};

module.exports.newEvent = function () {
    return new Event();
};
