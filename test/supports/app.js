/*!
 * koa.io - test/supports/session_app.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var koa = require('../../');

module.exports = function SessionApp() {
  var app = koa();
  app.keys = ['secrect'];

  app.io.use(function* (next) {
    // we can't send cookie in ioc
    this.header.cookie = this.query.cookie;
    yield *next;
  });

  app.session({
    namespace: '/'
  });

  app.use(function* () {
    this.session.user = { name: 'foo' };
    this.body = 'hello';
  });

  app.io.use(function* (next) {
    if (!this.session.user) {
      return this.socket.emit('forbidden');
    }
    this.emit('user join', this.session.user.name);
    yield *next;
    this.emit('user leave', this.session.user.name);
  });

  app.io.route('message', function* (next, message) {
    this.emit('message', message);
    yield *next;
  });

  return app;
};
