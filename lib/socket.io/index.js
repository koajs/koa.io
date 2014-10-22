/*!
 * koa.io - lib/socket.io/index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Namespace = require('socket.io/lib/namespace');
var ExtentNamespace = require('./namespace');

Namespace.prototype.add = ExtentNamespace.add;

module.exports = require('socket.io');
