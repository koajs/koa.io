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
var wrap = require('co-event-wrap');
var Socket = require('./socket');
var Router = require('./router');
var co = require('co');

exports.add = function (client, fn) {
  debug('adding socket to nsp %s', this.name);
  var socket = Socket.create(this, client);
  socket._fn = fn;

  // koa style middleware support
  if (!this.gen) {
    this.gen = compose(this.fns.concat([this.router.middleware(), onconnect]));
  }

  var self = this;

  co(this.gen).call(socket, function (err) {
    if ('open' == client.conn.readyState) {
      if (err) {
        debug('socket error: %s', err.stack);
        return socket.error(err.data || err.message);
      }
    }
  });

  function* onconnect(next) {
    yield* next;
    yield process.nextTick;

    if ('open' == this.client.conn.readyState) {
      self.sockets.push(this);
      this.onconnect();
      if(this._fn) this._fn();
      self.emit('connect', this);
      self.emit('connection', this);

      var socket = this;
      yield function ondisconnect(done) {
        socket.once('disconnect', function (reason) {
          debug('disconnect by %s', reason);
          done(null, reason);
        });
      }
    } else {
      debug('next called after client was closed - ignoring socket');
    }
  }
  return socket;
};

exports.route = function (event, handler) {
  this.router.route(event, handler);
};

exports.router = Router();
