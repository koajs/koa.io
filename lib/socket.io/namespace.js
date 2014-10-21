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
var co = require('co');

exports.add = function (client, fn) {
  debug('adding socket to nsp %s', this.name);

  var socket = Socket.create(this, client);

  // koa style middleware support
  if (!this.gen) {
    this.gen = compose(this.fns);
  }

  var self = this;
  co(this.gen).call(socket, function (err) {
    process.nextTick(function(){
      if ('open' == client.conn.readyState) {
        if (err) return socket.error(err.data || err.message);

        // track socket
        self.sockets.push(socket);

        // it's paramount that the internal `onconnect` logic
        // fires before user-set events to prevent state order
        // violations (such as a disconnection before the connection
        // logic is complete)
        socket.onconnect();
        if (fn) fn();

        // fire user-set events
        self.emit('connect', socket);
        self.emit('connection', socket);
      } else {
        debug('next called after client was closed - ignoring socket');
      }
    });
  });

  return socket;
};
