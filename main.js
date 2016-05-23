var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
var socket = require('socket.io-client')('http://localhost:55555');
var Canvas = require('canvas');
var fs = require('fs');
var _ = require('lodash');
var ffmpeg = require('fluent-ffmpeg');

IMAGES = {
  ARENAS: [],
  FIGHTER_STATES: {}
};

function initialize(callback) {
  var arenas = 4;

  var fighters = ['kanye', 'trump'];

  var orientations = ['left', 'right'];

  var sprites = {
    'stand': 9,
    'walking': 9,
    'walking-backward': 9,
    'squating': 3,
    'health': 3, // flex
    'stand-up': 3,
    'high-kick': 7,
    'jumping': 6,
    'forward-jump': 8,
    'backward-jump': 8,
    'low-kick': 6,
    'low-punch': 5,
    'high-punch': 5,
    'fall': 7,
    'win': 6,
    'endure': 3,
    'squat-endure': 3,
    'uppercut': 5,
    'squat-low-kick': 3,
    'squat-high-kick': 4,
    'squat-low-punch': 3,
    'knock-down': 10,
    'attractive-stand-up': 4,
    'spin-kick': 8,
    'blocking': 3,
    'forward-jump-kick': 3,
    'backward-jump-kick': 3,
    'backward-jump-punch': 3,
    'forward-jump-punch': 3
  };

  var totalAssets = arenas + (fighters.length * orientations.length * _.sum(_.values(sprites)));
  var loadedAssets = 0;
  var onAssetLoad = function() {
    loadedAssets++;
    var percentage = Math.floor((loadedAssets * 100) / totalAssets);
    if (percentage === 100)
      callback();
  };

  for (var i = 0; i < arenas; i++) {
    var arenaImage = new Canvas.Image;
    arenaImage.onload = onAssetLoad;
    arenaImage.src = 'images/arenas/' + i + '/arena.png';
    IMAGES.ARENAS[i] = arenaImage;
  }

  fighters.forEach(function(fighter) {
    Object.keys(sprites).forEach(function(sprite) {
      orientations.forEach(function(orientation) {
        for (var i = 0; i < sprites[sprite]; i++) {
          var fighterImage = new Canvas.Image;
          var fighterSpriteSrc = 'images/fighters/' + fighter + '/' + orientation + '/' + sprite + '/' + i + '.png';
          fighterImage.onload = onAssetLoad;
          fighterImage.src = fighterSpriteSrc;
          IMAGES.FIGHTER_STATES[fighterSpriteSrc] = fighterImage;
        }
      });
    });
  });
}

initialize(function() {
  var canvas = new Canvas();
  canvas.height = 400;
  canvas.width = 600;
  canvas.patternQuality = 'fast';
  canvas.filter = 'fast';
  var context = canvas.getContext('2d');
  socket.on('state', function(state) {
    context.drawImage(IMAGES.ARENAS[state.arena], 0, 0, canvas.width, canvas.height);

    var gameOver = false;
    for (var i = 0; i < state.fighters.length; i++) {
      var fighter = state.fighters[i];

      context.drawImage(IMAGES.FIGHTER_STATES[fighter.state], fighter.x, fighter.y);

      if(fighter.life === 0)
        gameOver = true;
    }

    if(!gameOver) {
      setTimeout(function() {
        canvas.toDataURL('image/jpeg', 1, function(error, base64JPEG) {
          var jpeg = base64JPEG.replace(/^data:image\/jpeg;base64,/, "");
          fs.writeFile(__dirname + '/exports/' + new Date().toISOString() + '.jpeg',
            jpeg, 'base64', function(error) {
              if(error)
                console.dir(error);
          });
        });
      }, 1000);
    }
  });
});

server.listen(port, function() {
  console.log('Server listening on port', port);
})

app.get('/', function(req, res) {
  res.send('whaddup server')
})
