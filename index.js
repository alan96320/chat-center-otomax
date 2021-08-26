const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const whatsapp = require('./whatsapp/whatsapp');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/',(req, res) =>{
    res.sendFile('index.html',{root: __dirname});
})

io.on('connection',function (socket) {
    socket.emit('message', 'Connecting...');
    whatsapp.add(socket);
})

server.listen(8000,function () { 
    console.log('App running on: localhost:8000');
})