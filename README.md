Scanfs
======

A small library that does a breadth-first walk of the filesystem, and emits events on the way.

install
-------
    npm i --save git@github.com:isao/scanfs.git

usage
-----
See ./examples

test
----
    cd path/to/node_modules/scanfs
    npm test

tests use @substack's `tape`. if you have @gotwarlost's `istanbul` or @jsoverson's `plato` installed globally you can do these, respectively:

    npm run-script cover
    npm run-script plato

thanks
------
There are no direct dependencies, but these are optional, and nice:

* James Halliday for [tape](https://github.com/substack/tape/) test harness.
* Krishnan Anantheswaran for [istanbul](https://github.com/gotwarlost/istanbul/) unit test coverage.
* Jarrod Overson for [plato](https://github.com/jsoverson/plato) code complexity analysis.

license
-------
MIT licensed by permission from my employer. See LICENSE.txt.
