/*!
 * koa.io - test/application.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var client = require('./supports/client');
var App = require('./supports/app');
var request = require('supertest');
var pedding = require('pedding');
var should = require('should');

describe('lib/application.js', function () {
  describe('app', function () {
    it('should be instance of koa', function () {
      var app = App();
      (app instanceof require('koa')).should.be.ok;
    });
  });

  describe('app.io', function () {
    it('should be instanceof of socket.io', function () {
      var app = App();
      (app.io instanceof require('socket.io')).should.be.ok;
    });
  });

  describe('session', function () {
    describe('when no session', function () {
      it('should emit forbidden', function (done) {
        var app = App();
        var server = app.listen();
        var socket = client(server);
        done = pedding(done, 2);
        socket.on('connect', done);
        socket.on('forbidden', done);
      });
    });

    describe('when with session', function () {
      it('should emit user join', function (done) {
        var app = App();
        var server = app.listen();

        request(server)
          .get('/')
          .expect(200)
          .expect('hello', function (err, res) {
          should.not.exist(err);
          var cookie = encodeURIComponent(res.headers['set-cookie'].join(';'));
          var socket = client(server, {query: 'cookie=' + cookie});
          done = pedding(done, 2);
          socket.on('connect', done);
          socket.on('user join', function (name) {
            name.should.equal('foo');
            done();
          });
        });
      });
    });
  });

  describe('app.keys=', function () {
    it('should set app.io.keys', function () {
      var app = App();
      app.keys = ['foo'];
      app.io.keys.should.eql(['foo']);
      app._keys.should.eql(['foo']);
    });
  });

  describe('keys', function () {
    it('should get app._keys', function () {
      var app = App();
      app.keys = ['foo'];
      app.keys.should.equal(app._keys);
    });
  });
});

