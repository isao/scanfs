scanfs [![Build Status](https://travis-ci.org/isao/scanfs.png)](https://travis-ci.org/isao/scanfs)
======

A small library that does a breadth-first walk of the filesystem, and emits events on the way.

install
-------
    npm i --save scanfs

usage
-----
See [`./examples/`](./examples/).

limitations
-----------
Uses `fs.stat()` so symlinks are not distinguished and cycles are not detected.

test
----
    npm test

Tests use Isaac Schlueter's [tap](https://github.com/isaacs/node-tap) test harness. If you have Krishnan Anantheswaran's [istanbul](https://github.com/gotwarlost/istanbul/), or Jarrod Overson's [plato](https://github.com/jsoverson/plato) installed globally you can do these things too, respectively:

    npm run cover
    npm run plato

license
-------
MIT licensed by permission from my employer. See LICENSE.txt.
