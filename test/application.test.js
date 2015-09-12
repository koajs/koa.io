/*!
 * koa.io - test/application.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var client = require('./supports/client');
var App = require('./supports/app');
var request = require('supertest');
var pedding = require('pedding');
var should = require('should');

describe('lib/application.js', function libApplication() {
  describe('app', function dApp() {
    it('should be instance of koa', function itInstanceOfKoa() {
      var app = App();
      (app instanceof require('koa')).should.be.ok;
    });
  });

  describe('app.io', function dAppIO() {
    it('should be instanceof of socket.io', function itInstanceOfSocketIO() {
      var app = App();
      (app.io instanceof require('socket.io')).should.be.ok;
    });
  });

  describe('session', function dSession() {
    describe('when no session', function dWhenNoSession() {
      it('should emit forbidden', function itEmitForbidden(_done) {
        var app = App();
        var server = app.listen();
        var socket = client(server);
        var done = pedding(_done, 2);
        socket.on('connect', done);
        socket.on('forbidden', done);
      });
    });

    describe('when with session', function dWhenWithSession() {
      it('should emit user join', function itEmitUserJoin(_done) {
        var app = App();
        var server = app.listen();

        request(server)
          .get('/')
          .expect(200)
          .expect('hello', function requestDone(err, res) {
            should.not.exist(err);
            var cookie = encodeURIComponent(res.headers['set-cookie'].join(';'));
            var socket = client(server, {query: 'cookie=' + cookie});
            var done = pedding(_done, 2);
            socket.on('connect', done);
            socket.on('user join', function userJoin(name) {
              name.should.equal('foo');
              done();
            });
          });
      });

      it('should echo message', function itEchoMessage(_done) {
        var app = App();
        var server = app.listen();

        request(server)
          .get('/')
          .expect(200)
          .expect('hello', function requestDone(err, res) {
            should.not.exist(err);
            var cookie = encodeURIComponent(res.headers['set-cookie'].join(';'));
            var socket = client(server, {query: 'cookie=' + cookie});
            var done = pedding(_done, 2);
            socket.on('connect', done);
            socket.on('message', function messageHandler(message) {
              message.should.equal('message');
              done();
            });
            socket.emit('message', 'message');
          });
      });
    });
  });

  describe('app.keys=', function dAppKeys() {
    it('should set app.io.keys', function itAppIoKeys() {
      var app = App();
      app.keys = ['foo'];
      app.io.keys.should.eql(['foo']);
      app._keys.should.eql(['foo']);
    });
  });

  describe('keys', function dKeys() {
    it('should get app._keys', function itGetAppPrivateKeys() {
      var app = App();
      app.keys = ['foo'];
      app.keys.should.equal(app._keys);
    });
  });
});

