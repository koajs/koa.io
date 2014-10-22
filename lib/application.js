/*!
 * koa.io - lib/application.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Session = require('koa-generic-session');
var Socket = require('./socket.io');
var util = require('util');
var http = require('http');
var Koa = require('koa');

/**
 * Module exports.
 */

module.exports = Application;

/**
 * Application constructor
 * @param {Object} options for Socket.io
 */
function Application(options) {
  if (!(this instanceof Application)) return new Application;
  Koa.call(this);

  this.io = new Socket(options);
}

util.inherits(Application, Koa);

var app = Application.prototype;

app.__defineGetter__('keys', function () {
  return this._keys;
});

app.__defineSetter__('keys', function (val) {
  this._keys = val;
  this.io.keys = val;
});

app.session = function (opts) {
  var session = Session(opts);
  this.use(session);

  var namespace = opts.namespace || '/';
  this.io.of(namespace).use(session);
};

app.createServer = function () {
  var server = http.createServer(this.callback());
  this.io.attach(server);
  return server;
}

app.listen = function () {
  var server = this.createServer();
  return server.listen.apply(server, arguments);
};
