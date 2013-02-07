scanfs [![Build Status](https://travis-ci.org/isao/scanfs.png)](https://travis-ci.org/isao/scanfs)
======

A small library that does a breadth-first walk of the filesystem, and emits events on the way.

install
-------
    npm i --save scanfs

usage
-----
See ./examples

test
----
    npm test

Tests use James Halliday's [tape](https://github.com/substack/tape/) test harness. If you have Krishnan Anantheswaran's [istanbul](https://github.com/gotwarlost/istanbul/), or Jarrod Overson's [plato](https://github.com/jsoverson/plato) installed globally you can do these things too, respectively:

    npm run-script cover
    npm run-script plato

license
-------
MIT licensed by permission from my employer. See LICENSE.txt.
