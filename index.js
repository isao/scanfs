/*jslint node:true, sloppy:true */

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream');


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

function getStatCb(item, list, self) {
    return function statCb(err, stat) {
        var type = typer(err, stat);

        self.emit(type, {type: type, filepath: item, stat: stat, error: err});
        self.emit('*', {type: type, filepath: item, stat: stat, error: err});

        if ('dir' === type) {
            /*jslint stupid:true */
            fs.readdirSync(item).forEach(function (diritem) {
                list.push(item + '/' + diritem);
            });
        }

        if (list.length) {
            self.relatively(list);
        } else {
            self.emit('done', self.count);
        }
    };
}

function relatively(list) {
    var item = list.shift();
    if (item) {
        this.count += 1;
        fs.stat(item, getStatCb(item, list, this));
    }
}

function absolutely(f) {
    return this.relative(path.resolve(f));
}

function Scan() {
    this.count = 0;
    //this.typer = typerFn ? typerFn : typer;
}

Scan.prototype = Object.create(Stream.prototype, {
    relatively: {value: relatively},
    absolutely: {value: absolutely}
});

module.exports = Scan;
