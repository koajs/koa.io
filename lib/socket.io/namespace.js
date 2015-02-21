/*!
 * koa.io - lib/socket.io/namespace.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('koa.io:socket.io:namespace');
var compose = require('koa-compose');
var Socket = require('./socket');
var Router = require('./router');
var co = require('co');

/**
 * Adds a new client.
 * rewrite socket.io's namespace.prototype.add
 *
 * @return {Socket}
 * @api private
 */

exports.add = function (client, fn) {
  debug('adding socket to nsp %s', this.name);
  var socket = Socket(this, client);
  socket._fn = fn;

  // koa style middleware support
  if (!this.gen) {
    this._onconnect = onconnect(this);
    debug('compose middlewares');
    this.gen = compose(this.fns.concat([this.router.middleware(), this._onconnect]));
  }

  var self = this;

  co.wrap(this.gen).call(socket, function (err) {
    if (client.conn.readyState === 'open') {
      if (err) {
        return socket.socket.error(err.data || err.message);
      }
    }
  });

  return socket.socket;
};


/**
 * wrap a fn to a middleware function
 *
 * @param {GeneratorFunction} fn
 * @api public
 */
exports.use = function (fn) {
  this.fns.push(createMiddleware(fn, this));
  return this;
};

/**
 * add route for socket event
 *
 * @param {String|RegExp} event
 * @param {GeneratorFunction} handler
 * @return {this}
 */

exports.route = function (event, handler) {
  this.router.route(event, handler);
  return this;
};

/**
 * init the router
 */

exports.router = Router();

/**
 * onconnect middleware
 */

function onconnect(nsp) {
  return function* () {
    debug('on connect');
    yield process.nextTick;

    var socket = this.socket;
    var fn = this._fn;

    if (socket.client.conn.readyState !== 'open') {
      debug('next called after client was closed - ignoring socket');
    }

    nsp.sockets.push(socket);
    socket.onconnect();

    if(fn) fn();

    nsp.emit('connect', socket);
    nsp.emit('connection', socket);

    // after socket emit disconnect, resume middlewares
    yield function ondisconnect(done) {
      socket.once('disconnect', function (reason) {
        debug('socket disconnect by %s', reason);
        done(null, reason);
      });
    }
  };
}

/**
 * wrap a generatorFunction to koa.io's middleware
 *
 * @param {GeneratorFunction} fn
 * @return {GeneratorFunction}
 * @api private
 */

function createMiddleware(fn, nsp) {
  return function* (next) {
    var done = true;

    yield* fn.call(this, _next.call(this));
    function* _next() {
      debug('yield next, continue middlewares');
      done = false;
      yield* next;
    }

    if (done) yield* nsp._onconnect.call(this);
  }
}

