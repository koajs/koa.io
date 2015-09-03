/*!
 * koa.io - lib/socket.io/router.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('koa.io:socket.io:router');
var compose = require('koa-compose');
var util = require('util');
var co = require('co');

/**
 * Module expose.
 */

module.exports = Router;

/**
 * a simple event router object
 */

function Router() {
  if (!(this instanceof Router)) return new Router();
  this.fns = [];
};

/**
 * create a socket.io middleware
 *
 * @return {GeneratorFunction}
 */

Router.prototype.middleware = function () {
  var self = this;
  var gen = compose(this.fns);
  return function* router(next) {
    debug('in router middleware');
    if (!self.fns.length) {
      debug('router not exist');
      return yield* next;
    }
    var context = this;
    var socket = this.socket;

    // replace socket.onevent to start the router
    socket._onevent = socket.onevent;
    socket.onevent = function (packet) {
      var args = packet.data || [];
      if(null != packet.id) {
        debug('attaching ack callback to event')
        args.push(socket.ack(packet.id))
      }
      if (!args.length) {
        debug('event args not exist');
        return socket._onevent(packet);
      }

      context.event = args[0];
      context.data = args.slice(1);

      co.wrap(gen).call(context, function (err) {
        if (err) console.error(err.stack);
        //TODO: error
        socket._onevent(packet);
      });
    };

    yield* next;
  };
};


/**
 * add a route into router
 * @param {String|RegExp} event
 * @param {GeneratorFunction} fn
 */

Router.prototype.route = function (event, fn) {
  this.fns.push(createRoute(event, fn));
};

/**
 * create a router with event match
 * @return {GeneratorFunction}
 */

function createRoute(event, fn) {
  if (typeof event === 'function') {
    fn = event;
    event = null;
  }

  var checker = createChecker(event);

  return function* (next) {
    debug('check `%s` to match `%s`, %s', this.event, event, checker(this.event));
    if (!checker(this.event)) {
      return yield* next;
    }
    var args = [next].concat(this.data);
    yield* fn.apply(this, args);
  }
}

/**
 * create a event checker
 * @param {String|RegExp} name
 * @return {function}
 */

function createChecker(name) {
  if (!name) {
    return function () {
      return true;
    }
  }

  if (typeof name === 'string') {
    name = name.replace(/\*/g, '.*?');
    name = new RegExp('^' + name + '$');
  }

  debug('regexp: %s', name);
  return function (event) {
    return !!event.match(name);
  }
}
