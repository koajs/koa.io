koa.io
---------------
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/koajs/koa.io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]
[![node version][node-image]][node-url]

[npm-image]: https://img.shields.io/npm/v/koa.io.svg
[npm-url]: https://npmjs.org/package/koa.io
[travis-image]: https://img.shields.io/travis/koajs/koa.io.svg
[travis-url]: https://travis-ci.org/koajs/koa.io
[coveralls-image]: https://img.shields.io/coveralls/koajs/koa.io.svg
[coveralls-url]: https://coveralls.io/r/koajs/koa.io?branch=master
[david-image]: https://img.shields.io/david/koajs/koa.io.svg
[david-url]: https://david-dm.org/koajs/koa.io
[david-dev-image]: https://david-dm.org/koajs/koa.io/dev-status.svg
[david-dev-url]: https://david-dm.org/koajs/koa.io#info=devDependencies
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.11-red.svg
[node-url]: http://nodejs.org/download/
[gittip-image]: https://img.shields.io/gittip/dead-horse.svg
[gittip-url]: https://www.gittip.com/dead-horse/

Realtime web framework combine [koa](http://koajs.com) and [socket.io](http://socket.io).

___This project is under development now.___ 

## Feature

- `socket.io` support koa style middleware when socket connect and disconnect.
- socket event route support.
- Make `socket.io`'s event handler support generator function.
- Extent `socket.io`'s `socket` object like `koa`'s `context`, to compact with some `koa`'s middlewares.

## Installation

```bash
$ npm install koa.io --save
```

## Usage

```js
var koa = require('koa.io');

var app = koa();

// middleware for koa
app.use(function*() {
});


// middleware for scoket.io's connect and disconnect
app.io.use(function* (next) {
  // on connect
  yield* next;
  // on disconnect
});

// router for socket event
app.io.route('new message', function* () {
  // we tell the client to execute 'new message'
  var message = this.args[0];
  this.broadcast.emit('new message', message);
});

app.listen(3000);
```

Please check out this simple [chat example](example/chat).

### License

MIT
