const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const QR = require('qrcode');
const IMCenter = require('../controller/IMCenterController');
const Inbox = require('../controller/inboxController');
const Outbox = require('../controller/outboxController');
const SESSION_FOLDER = 'service/session/';
let i = 1;
function create(socket,data) {
    console.log('lagi initianlisasi');
    let sessionCfg;
    let info;
    if (data) {
        if (fs.existsSync(`${SESSION_FOLDER}whatsapp-session-${data.username}.json`)) {
            sessionCfg = require(`./session/whatsapp-session-${data.username}.json`);
        }else{
            console.log('file tidak di temukan');
        }
    }
    const client = new Client({ 
        restartOnAuthFail: true,
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
        },
        session: sessionCfg 
    });

    client.on('qr', async (qr) => {
        i++;
        console.log(qr);
        QR.toDataURL(qr, (err, url) => {
            socket.emit('qrWhatsapp', {
                message:'Please scan SQ Code whatsapp',
                url:url
            });
            socket.emit('message', 'QR Code whatsapp received, scan please!');
        });
        if (i >= 10) {
            socket.emit('message', 'Times out scan QR');
            socket.emit('timeOutScan','Times out this page, Please refresh or close and create again..');
            i = 1;
        }
    });

    client.on('authenticated', (session) => {
        console.log('AUTHENTICATED', session);
        sessionCfg=session;
    });

    client.on('ready', () => {
        info = client.info;
        if (info) {
            socket.emit('message',`Whatsapp ${info.me.user} is ready!`)
            if (!fs.existsSync(`${SESSION_FOLDER}whatsapp-session-${info.me._serialized}.json`)) {
                fs.writeFile(`${SESSION_FOLDER}whatsapp-session-${info.me._serialized}.json`, JSON.stringify(sessionCfg), function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
                // tambahkan data ke database
                IMCenter.add({
                    type: 'whatsapp',
                    username: info.me._serialized,
                    label: info.me.user,
                    startup: 'on'
                }).then(e => {
                    socket.emit('resAccountAdd',e);
                });
            }else{
                socket.emit('whatsappReady',{
                    username:info.me._serialized
                });
            }
        }
        console.log('Client is ready!');
    });

    client.on('message', msg => {
        Inbox.add({
            penerima:msg.to,
            pengirim:msg.from,
            type:'y',
            pesan:msg.body
        }).then(e => {
            if (e) {
                socket.emit('chatIn',{
                    username:e.penerima,
                    pesan:e.pesan,
                    tanggal:e.tgl_entri
                });
                chatOut(msg,socket,e);
            }
        });
    });

    client.on('disconnected', (reason) => {
        socket.emit('message', 'Whatsapp is disconnected!');

        // untuk menghapus file session json
        fs.unlinkSync(`${SESSION_FOLDER}whatsapp-session-${info.me._serialized}.json`, function(err) {
            if(err) return console.log(err);
        });

        // hapus data dari database
        IMCenter.deleted({
            username:info.me._serialized
        }).then(e => {
            console.log(`Data Whatsapp ${info.me._serialized} is deleted`);
        })
        socket.emit('disconedWhatsapp',{
            username:info.me._serialized
        })
        client.destroy();
    });

    client.initialize();
}

let ii = 1;
function chatOut(msg,socket,data) {
    console.log('percobaan ke- '+ii);
    Outbox.getOne(data).then(e => {
        if (e) {
            socket.emit('chatOut',{
                username:data.penerima,
                pesan:e.pesan,
                tanggal:e.tgl_entri
            });
            socket.emit('message', 'Out from: ' + data.penerima + ' || to: ' + data.pengirim + ' || message: '+e.pesan);
            msg.reply(e.pesan);
            Inbox.update(e);
            Outbox.update(e,data.penerima);
        }else{
            if (i <= 120) {
                setTimeout(() => {
                    chatOut(msg,socket,data);
                    i++;
                }, 500);
            }else{
                i = 1;
                console.log('percobaan melebihi batas');
            }
        }
    })
}

module.exports = {create};