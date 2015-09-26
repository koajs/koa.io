/* (c) 2015 Ari Porad (@ariporad) <ari@ariporad.com>. MIT Licensed */

/**
 * Module dependencies.
 */

var debug = require('debug')('koa.io:socket.io:namespace');
var compose = require('koa-compose');
var Socket = require('./socket');
var co = require('co');

/**
 * onconnect middleware
 */

function onconnect(nsp) {
  return function* onconnectMiddleware() {
    debug('on connect');
    yield process.nextTick;

    var socket = this.socket;
    var fn = this._fn;

    if (socket.client.conn.readyState !== 'open') {
      debug('next called after client was closed - ignoring socket');
      return;
    }

    nsp.sockets.push(socket);
    socket.onconnect();

    if (fn) fn();

    nsp.emit('connect', socket);
    nsp.emit('connection', socket);

    // after socket emit disconnect, resume middlewares
    yield function ondisconnect(done) {
      socket.once('disconnect', function socketDisconnected(reason) {
        debug('socket disconnect by %s', reason);
        done(null, reason);
      });
    };
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
  return function* middleware(next) {
    var done = true;

    function* _next() {
      debug('yield next, continue middlewares');
      done = false;
      yield* next;
    }

    yield* fn.call(this, _next.call(this));

    if (done) yield* nsp._onconnect.call(this);
  };
}

/**
 * Adds a new client.
 * rewrite socket.io's namespace.prototype.add
 *
 * @return {Socket}
 * @api private
 */

exports.add = function add(client, fn) {
  debug('adding socket to nsp %s', this.name);
  var socket = Socket(this, client);
  socket._fn = fn;

  // koa style middleware support
  if (!this.gen) {
    this._onconnect = onconnect(this);
    debug('compose middlewares');
    this.gen = compose(this.fns.concat([this.router.middleware(), this._onconnect]));
  }

  co.wrap(this.gen).call(socket)
    .catch(function catchError(err) {
      /* istanbul ignore else */
      if (client.conn.readyState === 'open') {
        /* istanbul ignore else */
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
exports.use = function use(fn) {
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

exports.route = function route(event, handler) {
  this.router.route(event, handler);
  return this;
};
