/*!
 * koa.io - lib/application.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Socket = require('./socket.io');
var util = require('util');
var http = require('http');
var Koa = require('koa');

var Session;

/**
 * Module exports.
 */

module.exports = Application;

/**
 * Application constructor
 *
 * @param {Object} options for Socket.io
 */

function Application(options) {
  if (!(this instanceof Application)) return new Application;
  Koa.call(this);

  this.io = new Socket(options);
}

util.inherits(Application, Koa);

var app = Application.prototype;

/**
 * get the keys for signed cookies
 *
 * @return {Array}
 */

app.__defineGetter__('keys', function () {
  return this._keys;
});

/**
 * set the keys for signed cookies
 *
 * @param [Array] keys
 */

app.__defineSetter__('keys', function (keys) {
  this._keys = keys;
  this.io.keys = keys;
});

/**
 * an easy way to
 * @param {[type]} opts [description]
 * @return {[type]} [description]
 */

app.session = function (opts) {
  opts = opts || {};
  if (!Session) Session = require('koa-generic-session');

  var session = Session(opts);
  this.use(session);

  var namespace = opts.namespace || ['/'];
  if (!Array.isArray(namespace)) {
    namespace = [namespace];
  }

  var self = this;
  namespace.forEach(function () {
    self.io.of(namespace).use(session);
  });
};

/**
 * create a http server
 * and attach socket.io to this server
 *
 * @return {HttpServer}
 */

app.createServer = function () {
  var server = http.createServer(this.callback());
  this.io.attach(server);
  return server;
}

/**
 * create a http server
 * attach socket.io to this server
 * listen
 *
 * @param {Mixed} ...
 * @return {Server}
 * @api public
 */

app.listen = function () {
  var server = this.createServer();
  return server.listen.apply(server, arguments);
};
