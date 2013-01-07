#!/usr/bin/env node
'use strict';

var scan = new (require('./'))(),
    args = process.argv.slice(2);


function toLog(prefix, level) {
	return function (filemeta) {
		console[level || 'log'](filemeta.file + (filemeta.type === 'directory' ? '/' :''));
	}
}

scan.on('directory',   toLog());
scan.on('file',        toLog());
scan.on('other',       toLog('warn'));
scan.on('error',       toLog('error'));

if (!args.length) {
	args.push(process.cwd());
}

args.forEach(function (arg) {
	scan.relative(arg);
});
