/*!
 * project - module
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var qs = require('querystring');
var should = require('should');
var Koa = require('../../');
var Client = require('../supports/client');

describe('lib/socket.io/socket.js', function describeLibSocketIOsocket() {
  var app;
  var server;
  var client;

  function middleware(fn) {
    fn && app.io.use(fn);
    client = Client(server);
  }

  beforeEach(function startServer(done) {
    app = Koa();
    server = app.createServer();
    server.listen(done);
  });

  afterEach(function stopServer() {
    server.close();
    client && client.disconnect();
  });

  describe('socket', function describeSocket() {
    it('should get socket ok', function itShouldGetSocketOK(done) {
      middleware(function* socketShouldBeAnObject() {
        this.socket.should.be.Object;
        done();
      });
    });

    describe('delegates', function describeDelegates() {
      it('should delegate this.socket', function itShouldDelegatesThisSocketOK(done) {
        middleware(function* testShouldDelegatesThisSocketOKMiddleware() {
          this.client.should.equal(this.socket.client);
          this.server.should.equal(this.socket.server);
          this.adapter.should.equal(this.socket.adapter);
          this.id.should.equal(this.socket.id);
          this.request.should.equal(this.socket.request);
          this.conn.should.equal(this.socket.conn);
          this.rooms.should.equal(this.socket.rooms);
          this.acks.should.equal(this.socket.acks);
          this.json.should.equal(this.socket.json);
          this.volatile.should.equal(this.socket.volatile);
          this.broadcast.should.equal(this.socket.broadcast);
          this.connected.should.equal(this.socket.connected);
          this.disconnected.should.equal(this.socket.disconnected);
          this.handshake.should.equal(this.socket.handshake);
          this.join.should.be.Function;
          this.leave.should.be.Function;
          this.emit.should.be.Function;
          this.to.should.be.Function;
          this.in.should.be.Function;
          this.send.should.be.Function;
          this.write.should.be.Function;
          this.disconnect.should.be.Function;
          done();
        });
      });
    });
  });

  describe('header', function describeHeader() {
    it('should return this.socket.request.headers',
      function itShouldReturnThisSocketRequestHeaders(done) {
        middleware(function* testSocketHeaderMiddleware() {
          this.header.should.equal(this.socket.request.headers);
          this.header.accept.should.equal('*/*');
          done();
        });
      });
  });

  describe('headers', function headers() {
    it('should return this.socket.request.headers',
      function itShouldReturnThisSocketRequestHeaders(done) {
        middleware(function* testSocketHeadersMiddleware() {
          this.headers.should.equal(this.socket.request.headers);
          this.headers.accept.should.equal('*/*');
          done();
        });
      });
  });

  describe('url', function url() {
    it('should return this.socket.request.url', function shouldReturnThisSocketRequestUrl(done) {
      middleware(function* testUrlMiddleware() {
        this.url.should.equal(this.socket.request.url);
        this.url.should.containEql('/socket.io/');
        done();
      });
    });
  });

  describe('path', function path() {
    it('should return this.socket.request.url path',
      function shouldReturnThisSocketRequestUrlPath(done) {
        middleware(function* pathShouldEqualSocketIo() {
          this.path.should.equal('/socket.io/');
          done();
        });
      });
  });

  describe('query', function query() {
    it('should return this.socket.request.url query',
      function shouldReturnThisSocketRequestUrlQuery(done) {
        middleware(function* transportShouldEqualPolling() {
          this.query.transport.should.equal('polling');
          done();
        });
      });
  });

  describe('querystring', function querystring() {
    it('should return this.socket.request.url querystring',
      function shouldReturnTHisSocketRequestUrlQuerystring(done) {
        middleware(function* querystringTransportShouldEqualPolling() {
          qs.parse(this.querystring).transport.should.equal('polling');
          done();
        });
      });
  });

  describe('search', function search() {
    it('should return this.socket.request.url search',
      function shouldReturnThisSocketRequestUrlSearch(done) {
        middleware(function* searchTestMiddleware() {
          this.search[0].should.equal('?');
          qs.parse(this.search.slice(1)).transport.should.equal('polling');
          done();
        });
      });
  });

  describe('host', function dHost() {
    it('should be the host of the server', function host(done) {
      middleware(function* hostMiddleware() {
        this.host.should.equal('0.0.0.0:' + server.address().port);
        done();
      });
    });
  });

  describe('hostname', function dHostname() {
    it('should be localhost', function hostname(done) {
      middleware(function* hostnameMiddleware() {
        this.hostname.should.equal('0.0.0.0');
        done();
      });
    });
  });

  describe('charset', function dCharset() {
    // TODO: With a charset
    it('should be null (it hasn\'t been set)', function charset(done) {
      middleware(function* charsetMiddleware() {
        should(this.charset).equal(null);
        done();
      });
    });
  });

  describe('protocol', function dProtocol() {
    it('should be http', function protocol(done) {
      middleware(function* protocolMiddleware() {
        this.protocol.should.equal('http');
        done();
      });
    });
  });

  describe('secure', function dSecure() {
    it('should be false', function secure(done) {
      middleware(function* secureMiddleware() {
        this.secure.should.equal(false);
        done();
      });
    });
  });

  describe('ip', function dIP() {
    it('should be ::ffff:127.0.0.1 (127.0.0.1 mapped to IPv6)', function ip(done) {
      middleware(function* ipMiddleware() {
        this.ip.should.equal('::ffff:127.0.0.1');
        done();
      });
    });
  });

  describe('ips', function dIP() {
    // TODO: With a proxy
    describe('without a proxy', function dWithoutAProxy() {
      it('should be []', function ips(done) {
        middleware(function* ipsMiddleware() {
          this.ips.should.deepEqual([]);
          done();
        });
      });
    });
  });

  describe('get header', function dGetHeader() {
    it('should return undefined when a header doesn\'t exist', function doesntExist(done) {
      middleware(function* doesntExistMiddleware() {
        should(this.get('X-Doesnt-Exist')).equal(undefined);
        done();
      });
    });
  });

  describe('error handling', function dError() {
    it('should properly handle errors thrown in a generator', function error(done) {
      var err = new Error('EVERYTHING IS SO BROKEN!!!!');
      middleware(function* errorMiddleware() {
        throw err;
      });
      client.on('error', function onError(e) {
        e.should.equal(err.message);
        done();
      });
    });
  });
});
