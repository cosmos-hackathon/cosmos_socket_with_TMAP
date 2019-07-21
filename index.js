var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");
var port = process.env.PORT || 3000;
var request = require("request");


app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index2.html')
  console.log("Hello 2")
})

var lonlat;
io.on('connection', function (socket) {

  socket.on('LonLat', ll => {
    socket.broadcast.emit('verification', ll)
    lonlat = ll
  })

  socket.on('accept', (id) => {

    console.log(id)

    var options = {
      method: 'POST',
      url: 'https://c20846c3.ngrok.io/pay',
      headers:
      {
        'Postman-Token': '90ed989a-60fb-4eb3-be13-36f40271f4f8',
        'cache-control': 'no-cache',
        'Content-Type': 'application/json'
      },
      body: { name: id },
      json: true
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);



      socket.emit('receivemarker', lonlat);
      socket.emit('balance', body);
      socket.broadcast.emit('receivemarker', lonlat)
      socket.broadcast.emit('balance', body)
     
      console.log(body);
    });


  })
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
