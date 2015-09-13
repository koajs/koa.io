/*!
 * koa.io - test/application.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Client = require('./supports/client');
var App = require('./supports/app');
var request = require('supertest');
var pedding = require('pedding');
var should = require('should');

describe('lib/application.js', function libApplication() {
  var app;
  var server;
  beforeEach(function startApp(done) {
    app = App();
    server = app.createServer();
    server.listen(done);
  });
  afterEach(function stopApp(done) {
    server.close(done);
  });
  describe('app', function dApp() {
    it('should be instance of koa', function itInstanceOfKoa() {
      (app instanceof require('koa')).should.be.ok;
    });
  });

  describe('app.io', function dAppIO() {
    it('should be instanceof of socket.io', function itInstanceOfSocketIO() {
      (app.io instanceof require('socket.io')).should.be.ok;
    });
  });

  describe('session', function dSession() {
    describe('when no session', function dWhenNoSession() {
      var client;
      beforeEach(function createClient() {
        client = Client(server);
      });
      afterEach(function closeClient() {
        client.disconnect();
      });
      it('should emit forbidden', function itEmitForbidden(_done) {
        var done = pedding(_done, 2);
        client.on('connect', done);
        client.on('forbidden', done);
      });
    });

    describe('when with session', function dWhenWithSession() {
      it('should emit user join', function itEmitUserJoin(_done) {
        request(server)
          .get('/')
          .expect(200)
          .expect('hello', function requestDone(err, res) {
            should.not.exist(err);
            var cookie = encodeURIComponent(res.headers['set-cookie'].join(';'));
            var socket = Client(server, {query: 'cookie=' + cookie});
            var done = pedding(_done, 2);
            socket.on('connect', done);
            socket.on('user join', function userJoin(name) {
              name.should.equal('foo');
              socket.disconnect();
              done();
            });
          });
      });

      it('should echo message', function itEchoMessage(_done) {
        request(server)
          .get('/')
          .expect(200)
          .expect('hello', function requestDone(err, res) {
            should.not.exist(err);
            var cookie = encodeURIComponent(res.headers['set-cookie'].join(';'));
            var socket = Client(server, {query: 'cookie=' + cookie});
            var done = pedding(_done, 2);
            socket.on('connect', done);
            socket.on('message', function messageHandler(message) {
              message.should.equal('message');
              socket.disconnect();
              done();
            });
            socket.emit('message', 'message');
          });
      });
    });
  });

  describe('app.keys=', function dAppKeys() {
    it('should set app.io.keys', function itAppIoKeys() {
      app.keys = ['foo'];
      app.io.keys.should.eql(['foo']);
      app._keys.should.eql(['foo']);
    });
  });

  describe('keys', function dKeys() {
    it('should get app._keys', function itGetAppPrivateKeys() {
      app.keys = ['foo'];
      app.keys.should.equal(app._keys);
    });
  });
});

