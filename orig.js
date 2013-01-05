#!/usr/bin/env node
'use strict';

var fs = require('fs'),
    ee = new (require('events').EventEmitter)(),
    path = require('path'),
    arg = process.argv[2] || process.cwd();


ee.on('directory', console.log);
ee.on('file', console.log);
ee.on('other', console.warn);
ee.on('error', console.warn);

function scan(err, dir) {

    function onReaddir(err, files) {
        files.forEach(function per(file) {
            scan(null, path.resolve(fullpath, file));
        });
    }

    function onStat(err, stat) {
        switch(true) {
            case err:
                type = 'error';
                break;
            case stat.isDirectory():
                type = 'directory';
                fs.readdir(fullpath, onReaddir);
                break;
            case stat.isFile():
                type = 'file';
                break;
            default:
                type = 'other';
        }
        ee.emit(type, fullpath, stat);
    }

    var fullpath = path.resolve(dir);
    fs.stat(fullpath, onStat);
}

scan(null, arg);
