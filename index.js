const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const xmpp = require('simple-xmpp');
const CryptoJS = require("crypto-js");
const whatsapp = require('./service/whatsapp');
const jabbim = require('./service/jabbim');
const telegram = require('./service/telegram');

const IMCenter = require('./controller/IMCenterController');
const Inbox = require('./controller/inboxController');
const Outbox = require('./controller/outboxController');

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

io.on('connection', async (socket) => {
    socket.emit('message', 'Socket is ready...');

    // ambil data untuk pertama kali
    var data;
    await IMCenter.getAll().then(res => {
        data = {
            "jabbim":res[3] ? res[3] : [],
            "telegram":res[4] ? res[4] : [],
            "whatsapp":res[5] ? res[5] : [],
        }
        socket.emit('dataAccount', data);
    })

    // untuk jabbim
    socket.emit('message', 'Sedang mempersiapkan jabbim...');
    if (data.jabbim.length > 0) {
        data.jabbim.forEach(async e =>  {
            socket.emit('message', 'Connecting with jabbim: '+e.username);
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

    // untuk whatsapp
    socket.emit('message', 'Sedang mempersiapkan whatsapp...');
    if (data.whatsapp.length > 0) {
        data.whatsapp.forEach(element => {
            socket.emit('message', 'Connecting with whatsapp: '+element.username);
            new whatsapp.create(socket,{
                username:element.username,
                id:element.id
            })
        });
    } else {
        socket.emit('message', 'Whatsapp ready...');
    }
    socket.on('addWhatsapp', async (data) => {
        data.id = null;
        new whatsapp.create(socket,data);
    })
    socket.on('cancelScan',(status) => {
        if (status) {
            socket.emit('message','Scan QR canceled..');
            console.log('Scan QR canceled..');
        }
    })

    // untuk telegram
    // 1995723271:AAHd-ecl6DVPpCDb5M_S9Bz_ukY6VfaUbds
    // 1966888472:AAGF_YjTR5mqIsD8VmVHiy89KXEk95Z_BdY
    socket.emit('message', 'Sedang mempersiapkan telegram...');
    if (data.telegram.length > 0) {
        data.telegram.forEach(element => {
            socket.emit('message', 'Connecting with telegram: '+element.username);
            var token = CryptoJS.AES.decrypt(element.password, element.username).toString(CryptoJS.enc.Utf8);
            telegram.MyBot(token,socket,element.username,element.id);
        });
    }else{
        socket.emit('message', 'Telegram ready...');
    }

    socket.on('AccountAdd', async (data) => {
        if (data.type == 'telegram') {
            await telegram.authenticated(data.token).then(e => {
                if (e.status) {
                    data.username = e.username;
                }else{
                    socket.emit('errorAuthTelegram','Token is not found..');
                }
            });
        }
        IMCenter.add(data).then(e => {
            if (data.type == 'telegram') {
                telegram.MyBot(data.token,socket,e.username,e.id);
            }
            socket.emit('resAccountAdd',e);
        });
    });

    socket.on('AccountUpdate',async (data) => {
        if (data.type == 'telegram') {
            data.password = null;
            if (data.token != '') {
                await telegram.authenticated(data.token).then(e => {
                    if (e.status) {
                        data.username = e.username;
                        data.password = data.token;
                    }else{
                        socket.emit('errorAuthTelegram','Token is not found..');
                    }
                });   
            }
            
            
        }
        IMCenter.update(data).then(e => {
            if (data.type == 'telegram') {
                console.log(e.username);
                if (data.password != null) {
                    var token = CryptoJS.AES.decrypt(e.password, e.username).toString(CryptoJS.enc.Utf8);
                    telegram.MyBot(token,socket,e.username);
                }
            }
            socket.emit('resAccountUpdate',e);
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
                    socket.emit('resDeleteAccount',{
                        username: data.username,
                        type:data.type
                    })
                })
            })
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

    socket.on('clearChat', async (data) => {
        await Inbox.deleted({
            penerima: data.username
        }).then(async e => {
            await Outbox.deleted({
                pengirim: data.username
            }).then(e => {
                socket.emit('resClearAccount',{
                    username: data.username
                })
            })
        })
    })
    
})

server.listen(8000,function () { 
    console.log('App running on: localhost:8000');
})