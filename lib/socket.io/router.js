/*!
 * koa.io - lib/socket.io/router.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var debug = require('debug')('koa.io:socket.io:router');
var compose = require('koa-compose');
var co = require('co');

/**
 * create a event checker
 * @param {String|RegExp} name
 * @return {function}
 */

function createChecker(_name) {
  if (!_name) {
    return function dummyChecker() {
      return true;
    };
  }
  var name = _name;
  if (typeof name === 'string') {
    name = name.replace(/\*/g, '.*?');
    name = new RegExp('^' + name + '$');
  }

  debug('regexp: %s', name);
  return function checker(event) {
    var match = event.match(name);
    // only match the whole event
    return match && match.index === 0 && match[0].length === event.length;
  };
}

/**
 * create a router with event match
 * @return {GeneratorFunction}
 */

function createRoute(_event, _fn) {
  var fn = _fn;
  var event = _event;
  if (typeof event === 'function') {
    fn = event;
    event = null;
  }

  var checker = createChecker(event);

  return function* createdRoute(next) {
    debug('check `%s` to match `%s`, %s', this.event, event, checker(this.event));
    if (!checker(this.event)) {
      return yield* next;
    }
    var args = [next].concat(this.data);
    yield* fn.apply(this, args);
  };
}

/**
 * a simple event router object
 */

function Router() {
  if (!(this instanceof Router)) return new Router();
  this.fns = [];
}

/**
 * create a socket.io middleware
 *
 * @return {GeneratorFunction}
 */

Router.prototype.middleware = function middleware() {
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
    socket.onevent = function monkeypatchedOnEvent(packet) {
      var args = packet.data || [];
      if (!args.length) {
        debug('event args not exist');
        return socket._onevent(packet);
      }

      self.event = args[0];
      self.data = args.slice(1);

      co.wrap(gen).call(self)
        .then(function genSuccess() {
          socket._onevent(packet);
        })
        .catch(function genError(err) {
          debug('error: ' + err.message);
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

Router.prototype.route = function route(event, fn) {
  this.fns.push(createRoute(event, fn));
};

/**
 * Module expose.
 */

module.exports = Router;
