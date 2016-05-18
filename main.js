var express =  require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
var socket = require('socket.io-client')('http://localhost:55555');
var Canvas = require('canvas');
var fs = require('fs');
// socket.on('connect', function () {});
socket.on('state', function (state) {
  console.log(state);
});

server.listen(port, function () {
  console.log('Server listening on port', port);
});

app.get('/', function (req, res) {
  res.send(state);
});
