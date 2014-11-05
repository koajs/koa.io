/*!
 * koa.io - test/supports/client.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ioc = require('socket.io-client');

// creates a socket.io client for the given server
module.exports = function client(srv, nsp, opts) {
  if ('object' == typeof nsp) {
    opts = nsp;
    nsp = null;
  }
  opts = opts || {};

  var addr = srv.address && srv.address();
  if (!addr) addr = srv.listen().address();
  var url = 'ws://0.0.0.0:' + addr.port + (nsp || '');
  if (opts.query) {
    url += '?' + opts.query;
  }
  return ioc(url, opts);
};
