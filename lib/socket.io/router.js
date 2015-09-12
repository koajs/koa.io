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
  var router = this;
  var gen = compose(this.fns);
  return function* route(next) {
    debug('in router middleware');
    if (!router.fns.length) {
      debug('router not exist');
      return yield* next;
    }
    var self = this;
    var socket = this.socket;

    // replace socket.onevent to start the router
    socket._onevent = socket.onevent;
    socket.onevent = function (packet) {
      var args = packet.data || [];
      if (!args.length) {
        debug('event args not exist');
        return socket._onevent(packet);
      }

      self.event = args[0];
      self.data = args.slice(1);

      co.wrap(gen).call(self)
      .then(function () {
        socket._onevent(packet);
      })
      .catch(function (err) {
        console.error(err.stack);
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
