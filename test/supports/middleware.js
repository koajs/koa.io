/*!
 * koa.io - test/supports/middleware.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var client = require('./client');
var koa = require('../../');

module.exports = function middleware(fn) {
  var app = koa();
  app.keys = ['secret'];
  app.io.use(fn);
  client(app);
  return app;
};
