/*jslint node:true */
'use strict';

var fs = require("fs"),
    path = require("path");


function typer(err, stat) {
    var type = "other";
    if (err) {
        type = "error";
    } else if (stat.isFile()) {
        type = "file";
    } else if (stat.isDirectory()) {
        type = "dir";
    }
    return type;
}

function getStatCb(item, list) {
    return function statCb(err, stat) {
        var type = typer(err, stat);
        console.log(type, item, list.length);
        if ('dir' === type) {
            fs.readdirSync(item).forEach(function (diritem) {
                list.push(item + '/' + diritem);
            });
        }
        if (list.length) {
            scan(list);
        } else {
            console.log('done');
        }
    };
}

function scan(list) {
    var item = list.shift();
    if (item) {
        fs.stat(item, getStatCb(item, list));
    } else {
        console.log('done?');
    }
}

scan(["."])