var staticCache = require('koa-static-cache');
var koa = require('../..');
var path = require('path');
var fs = require('fs');

var app = koa();

var port = process.env.PORT || 3000;

// Routing
app.use(staticCache(path.join(__dirname, 'public')));

app.use(function*() {
  this.body = fs.createReadStream(path.join(__dirname, 'public/index.html'));
  this.type = 'html';
});

app.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

// middleware for connect and disconnect
app.io.use(function* userLeft(next) {
  yield* next;
  if (this.addedUser) {
    delete usernames[this.username];
    --numUsers;

    // echo globally that this client has left
    this.broadcast.emit('user left', {
      username: this.username,
      numUsers: numUsers
    });
  }
});

/**
 * router for socket event
 */

// when the client emits 'new message', this listens and executes
app.io.route('new message', function* () {
  // we tell the client to execute 'new message'
  this.socket.broadcast.emit('new message', {
    username: this.socket.username,
    message: this.args[0]
  });
});

app.io.route('add user', function* () {
  // we store the username in the socket session for this client
  var username = this.args[0];
  var socket = this.socket;

  socket.username = username;
  // add the client's username to the global list
  usernames[username] = username;
  ++numUsers;
  socket.addedUser = true;
  socket.emit('login', {
    numUsers: numUsers
  });
  // echo globally (all clients) that a person has connected
  socket.broadcast.emit('user joined', {
    username: socket.username,
    numUsers: numUsers
  });
});

// when the client emits 'typing', we broadcast it to others
app.io.route('typing', function* () {
  console.log('%s is typing', this.socket.username);
  this.socket.broadcast.emit('typing', {
    username: this.socket.username
  });
});

// when the client emits 'stop typing', we broadcast it to others
app.io.route('stop typing', function* () {
  console.log('%s is stop typing', this.socket.username);
  this.socket.broadcast.emit('stop typing', {
    username: this.socket.username
  });
});
