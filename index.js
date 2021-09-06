const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const xmpp = require('simple-xmpp');
const CryptoJS = require("crypto-js");
const whatsapp = require('./service/whatsapp');
const jabbim = require('./service/jabbim');
const telegram = require('./service/telegram');
const ChromeLauncher = require('chrome-launcher');

const IMCenter = require('./controller/IMCenterController');
const Inbox = require('./controller/inboxController');
const Outbox = require('./controller/outboxController');
const Service = require('./service/myService');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine', 'ejs');
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/fonts', express.static(path.join(__dirname, 'assets/fonts')));
app.use('/img', express.static(path.join(__dirname, 'assets/img')));

app.get('/', (req, res) => {
    res.render('chat');
})

app.get('/service',(req,res) => {
    console.log('get in service');
})

io.on('connection', async (socket) => {
    socket.emit('message', 'Socket is ready...');
    whatsapp.init(socket);
    jabbim.init(socket);
    telegram.init(socket);
    
    // untuk mengambil data
    socket.on('getData',(status) => {
        var params = {};
        params.sender_speed = 20;
        status == 'whatsapp' ? params.type = 5 : (status == 'jabbim' ? params.type = 3 : (status == 'telegram' ? params.type = 4 : ''));
        IMCenter.getAll(params).then((e) => {
            socket.emit('resGetData',{
                status:status,
                data:e
            })
        })
    })

    // untuk mengambil chatting
    socket.on('getChat', async (data) => {
        IMCenter.getOne({
            id:data.id
        }).then(e => {
            socket.emit('resGetChat', {
                username: data.username,
                data:e
            });
        })
    })
    
    socket.on('deleteAccount', async (data) => {
        await IMCenter.deleted({
            id:data.id
        }).then(async e => {
            await Inbox.deleted({
                penerima: data.username
            }).then(async e => {
                await Outbox.deleted({
                    pengirim: data.username
                }).then(e => {
                    socket.emit('resDeleteAccount', {
                        username: data.username,
                        type: data.type
                    })
                    if (data.type == 'whatsapp') {
                        whatsapp.abort(data.username);
                    }
                    if (data.type == 'telegram') {
                        telegram.abort(data.username);
                    }
                    if (data.type == 'jabbim') {
                        jabbim.logout(socket,data.username);
                    }
                })
            })
        })

    })

    socket.on('clearChat', async (data) => {
        await Inbox.deleted({
            penerima: data.username
        }).then(async e => {
            await Outbox.deleted({
                pengirim: data.username
            }).then(e => {
                socket.emit('resClearAccount', {
                    username: data.username
                })
            })
        })
    })

})


// socket untuk service
io.of('/service').on('connection', async (socket) => {
    console.log('Socket service connected.');
    io.of('/').emit('message','Socket Service connected.');
    socket.on('sendMessageWhatsapp', async (data) => {
        // console.log(data);
        await whatsapp.getSession().then(ex => {
            if (ex.length > 0) {
                var WA = ex.find(e => e.username == data.username);
                var client = WA.client;
                var penerima = data.penerima.replace('whatsapp.net','c.us');
                client.sendMessage(penerima, data.pesan).then(async response => {
                    console.log('sukses mengirimkan pesan ke',penerima);
                    io.of('/').emit('chatOut',{
                        username:data.username,
                        pesan:data.pesan,
                        tanggal:data.tgl
                    });
                    await Outbox.update({
                        kode: data.idOutbox,
                        kode_inbox: data.idinbox,
                        terminal: data.idImcenter,
                        pengirim: data.username
                    });
                    if (data.idinbox != null) {
                        await Inbox.update({
                            kode_inbox: data.idinbox
                        })
                    }
                }).catch(err => {
                    console.log(`Mengirimkan pesan ke ${penerima} gagal`,err);
                });
            }
        })
    })
    socket.on('sendMessageJabbim', async (data) => {
        await jabbim.getSession().then(async (ex) => {
            if (ex.length > 0) {
                var jb = ex.find(e => e.username == data.username);
                var client = jb.client;
                client.send(data.penerima,data.pesan);
                io.of('/').emit('chatOut',{
                    username:data.username,
                    pesan:data.pesan,
                    tanggal:data.tgl
                });
                await Outbox.update({
                    kode: data.idOutbox,
                    kode_inbox: data.idinbox,
                    terminal: data.idImcenter,
                    pengirim: data.username
                });
                if (data.idinbox != null) {
                    await Inbox.update({
                        kode_inbox: data.idinbox
                    })
                }
            }
        });
    })
    socket.on('sendMessageTelegram', async (data) => {
        await telegram.getSession().then(async (ex) => {
            if (ex.length > 0) {
                var tele = ex.find(e => e.username == data.username);
                var client = tele.client;
                client.sendMessage(data.penerima, data.pesan);
                io.of('/').emit('chatOut',{
                    username:data.username,
                    pesan:data.pesan,
                    tanggal:data.tgl
                });
                await Outbox.update({
                    kode: data.idOutbox,
                    kode_inbox: data.idinbox,
                    terminal: data.idImcenter,
                    pengirim: data.username
                });
                if (data.idinbox != null) {
                    await Inbox.update({
                        kode_inbox: data.idinbox
                    })
                }
            }
        });
    })
})

server.listen(9000, function () {
    ChromeLauncher.launch({
        startingUrl: 'http://localhost:9000',
    }).then(chrome => {
        console.log('App running on: http://localhost:9000');
        console.log(`Chrome debugging port running on ${chrome.port}`);
        Service.statusService().then(e => {
            if (!e) {
                Service.install();
            }
        });
    });
})