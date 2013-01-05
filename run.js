#!/usr/bin/env node
'use strict';

var fscan = require('./'),
    event = fscan.newEvent(),
    args = process.argv.slice(2);


function toLog(prefix, level) {
	return function (filemeta) {
		console[level || 'log'](filemeta.file + (filemeta.type === 'directory' ? '/' :''));
	}
}

event.on('directory',   toLog());
event.on('file',        toLog());
event.on('other',       toLog('warn'));
event.on('error',       toLog('error'));

if (!args.length) {
	args.push(process.cwd());
}

args.forEach(function (arg) {
	fscan(arg, event);
});
