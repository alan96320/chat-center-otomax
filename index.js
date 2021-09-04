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
    whatsapp.init(io);
    
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
        Inbox.getAll({
            kode_terminal:data.id
        }).then(e => {
            socket.emit('resGetChat', {
                username: data.username,
                data:e
            });
        })
    })


    // untuk whatsapp
    socket.emit('message', 'Sedang mempersiapkan whatsapp...');

    // untuk jabbim
    socket.emit('message', 'Sedang mempersiapkan jabbim...');

    socket.on('jabbimConn', async (data) => {
        socket.emit('message', 'Connecting with: ' + data.username);
        var conn = new xmpp.SimpleXMPP();
        await new jabbim.create(socket, data, conn);
        socket.on('logoutJabbim', function (e) {
            jabbim.logout(socket, conn, e);
        });
    })
    
    

    // untuk telegram
    // 1995723271:AAHd-ecl6DVPpCDb5M_S9Bz_ukY6VfaUbds
    // 1966888472:AAGF_YjTR5mqIsD8VmVHiy89KXEk95Z_BdY
    socket.emit('message', 'Sedang mempersiapkan telegram...');
    

    socket.on('AccountAdd', async (data) => {
        if (data.type == 'telegram') {
            await telegram.authenticated(data.token).then(e => {
                if (e.status) {
                    data.username = e.username;
                } else {
                    socket.emit('errorAuthTelegram', 'Token is not found..');
                }
            });
        }
        IMCenter.add(data).then(e => {
            if (data.type == 'telegram') {
                telegram.MyBot(data.token, socket, e.username, e.id);
            }
            socket.emit('resAccountAdd', e);
        });
    });

    socket.on('AccountUpdate', async (data) => {
        if (data.type == 'telegram') {
            data.password = null;
            if (data.token != '') {
                await telegram.authenticated(data.token).then(e => {
                    if (e.status) {
                        data.username = e.username;
                        data.password = data.token;
                    } else {
                        socket.emit('errorAuthTelegram', 'Token is not found..');
                    }
                });
            }


        }
        IMCenter.update(data).then(e => {
            if (data.type == 'telegram') {
                console.log(e.username);
                if (data.password != null) {
                    var token = CryptoJS.AES.decrypt(e.password, e.username).toString(CryptoJS.enc.Utf8);
                    telegram.MyBot(token, socket, e.username);
                }
            }
            socket.emit('resAccountUpdate', e);
        })
    })

    socket.on('deleteAccount', async (data) => {
        await IMCenter.deleted({
            username: data.username
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
        await whatsapp.getSession().then(ex => {
            if (ex.length > 0) {
                var WA = ex.find(e => e.username == data.username);
                var client = WA.client;
                var penerima = data.penerima.replace('whatsapp.net','c.us');
                client.sendMessage(penerima, data.pesan).then(async response => {
                    console.log('sukses mengirimkan pesan ke',penerima);
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
})

server.listen(8000, function () {
    ChromeLauncher.launch({
        startingUrl: 'http://localhost:8000',
    }).then(chrome => {
        console.log('App running on: http://localhost:8000');
        console.log(`Chrome debugging port running on ${chrome.port}`);
        Service.statusService().then(e => {
            if (!e) {
                Service.install();
            }
        });
    });
})