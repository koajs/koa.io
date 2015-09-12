/*!
 * koa.io - lib/socket.io/index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Namespace = require('socket.io/lib/namespace');
var ExtentNamespace = require('./namespace');
var Router = require('./router');

Namespace.prototype.__defineGetter__('router', function routerGetter() {
  if (!this._router) this._router = Router();
  return this._router;
});
Namespace.prototype.route = ExtentNamespace.route;
Namespace.prototype.add = ExtentNamespace.add;
Namespace.prototype.use = ExtentNamespace.use;

var Server = module.exports = require('socket.io');

Server.prototype.route = function route() {
  return this.sockets.route.apply(this.sockets, arguments);
};
