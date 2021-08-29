const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const xmpp = require('simple-xmpp');
const whatsapp = require('./whatsapp/whatsapp');
const jabbim = require('./jabbim/jabbim');

const IMCenter = require('./controller/IMCenterController');
const Inbox = require('./controller/inboxController');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine','ejs');
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/fonts', express.static(path.join(__dirname, 'assets/fonts')));
app.use('/img', express.static(path.join(__dirname, 'assets/img')));

app.get('/',(req, res) =>{
    res.render('chat');
})

var data = {
    "jabbim":[],
    "whatsapp":[],
    "telegram":[]
}
IMCenter.getAll().then(e=>{
    if (e[3]) {
        data.jabbim = e[3];
    }
    if (e[5]) {
        data.whatsapp = e[5];
    }
    if (e[4]) {
        data.telegram = e[4];
    }
});

io.on('connection', (socket) => {
    socket.emit('message', 'Socket is ready...');
    socket.emit('dataAccount', data);
    // untuk jabbim
    socket.emit('message', 'Sedang mempersiapkan jabbim...');
    if (data.jabbim.length > 0) {
        data.jabbim.forEach(async e =>  {
            socket.emit('message', 'Connecting with: '+e.username);
            var conn = new xmpp.SimpleXMPP();
            await new jabbim.create(socket,e,conn);
            socket.on('logoutJabbim', function(data) {
                jabbim.logout(socket,conn,data);
            });
        });
    } else {
        socket.emit('message', 'Jabbim ready...');
    }

    socket.on('jabbimConn', async (data) => {
        socket.emit('message', 'Connecting with: '+data.username);
        var conn = new xmpp.SimpleXMPP();
        await new jabbim.create(socket,data,conn);
        socket.on('logoutJabbim', function(e) {
            jabbim.logout(socket,conn,e);
        });
    })

    socket.on('AccountAdd',(data) => {
        IMCenter.add(data).then(e => {
            socket.emit('resAccountAdd',e);
        });
    });

    socket.on('AccountUpdate',(data) => {
        IMCenter.update(data).then(e => {
            socket.emit('resAccountUpdate',e);
        })
    })

    socket.on('getChat', async (data) => {
        var type = data.type == 'jabbim' ? 'g' : 'y';
        Inbox.getAll({
            penerima:data.username,
            type:type
        }).then(e => {
            socket.emit('resGetChat',{
                username:data.username,
                message:e,
                type:data.type
            });
        })
    })

    // untuk whatsapp
    // socket.emit('message', 'Sedang mempersiapkan whatsapp...');
    // if (data.whatsapp.length > 0) {
    //     data.whatsapp.forEach(e => {
    //         whatsapp.create(socket);
    //     });
    // } else {
    //     socket.emit('message', 'Whatsapp ready...');
    // }
    
})

server.listen(8000,function () { 
    console.log('App running on: localhost:8000');
})