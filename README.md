Scanfs
======

A small library that does a breadth-first walk of the filesystem, and emits events on the way.

install
-------
    npm i --save git+ssh://git@git.corp.yahoo.com:isao/scanfs.git#develop

usage
-----
See ./examples

test
----
    cd path/to/node_modules/scanfs
    npm test

if you have `istanbul` or `plato` installed globally you can do these, respectively:

    npm run-script cover
    npm run-script plato