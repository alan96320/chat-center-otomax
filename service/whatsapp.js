const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const QR = require('qrcode');
const IMCenter = require('../controller/IMCenterController');
const Inbox = require('../controller/inboxController');
const Outbox = require('../controller/outboxController');
const SESSION_FOLDER = 'service/session/';

var socket = null;

let i = 1;
const sessions = [];

function create(data){
    let sessionCfg;
    let info;
    var id = data.id;
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
        if (i >= 5) {
            socket.emit('message', 'Times out scan QR');
            socket.emit('timeOutScan','Times out this page, Please refresh or close and create again..');
            i = 1;
            client.destroy();
        }
    });

    client.on('authenticated', (session) => {
        sessionCfg=session;
    });

    client.on('ready', () => {
        info = client.info;
        if (info) {
            if (info.me != undefined) {
                socket.emit('message',`Whatsapp ${info.me.user} is ready!`)
                fs.writeFile(`${SESSION_FOLDER}whatsapp-session-${info.me._serialized}.json`, JSON.stringify(sessionCfg), function (err) {
                    if (err) {
                        console.error(err);
                    }
                });

                // ini jika pengguna baru
                if (!fs.existsSync(`${SESSION_FOLDER}whatsapp-session-${info.me._serialized}.json`)) {
                    // tambahkan data ke database
                    IMCenter.add({
                        type: 'whatsapp',
                        username: info.me._serialized,
                        label: info.me.user,
                        startup: 'on'
                    }).then(e => {
                        console.log(e);
                        user = e.id;
                        socket.emit('resAddwhatsapp',e);
                    });
                }
                // client.sendMessage('6281268018693@c.us','testing');
                console.log('Whatsapp ready:',info.me._serialized);

                // Tambahkan client ke sessions
                var index = sessions.findIndex(e => e.username == info.me._serialized);
                if (index > -1) {
                    sessions[index].client = client;
                }else{
                    sessions.push({
                        username: info.me._serialized,
                        client: client
                    });
                }
            }
        }
    });

    client.on('message', msg => {
        Inbox.add({
            penerima:msg.to,
            pengirim:msg.from,
            type:'y',
            pesan:msg.body,
            kode_terminal:id
        }).then(e => {
            if (e) {
                socket.emit('chatIn',{
                    username:e.penerima,
                    pesan:e.pesan,
                    tanggal:e.tgl_entri
                });
                // chatOut(msg,socket,e,id);
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
function chatOut(msg,socket,data,terminal) {
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
            Outbox.update(e,data.penerima,terminal);
            ii = 1;
            if (e.kode_transaksi != null) {
                chatOutTranction({
                    kode_transaksi:e.kode_transaksi,
                    penerima:data.penerima,
                    msg:msg,
                    socket:socket,
                    terminal:terminal
                });
            }
        }else{
            if (ii <= 120) {
                setTimeout(() => {
                    chatOut(msg,socket,data,terminal);
                    ii++;
                }, 500);
            }else{
                ii = 1;
                console.log('percobaan melebihi batas');
            }
        }
    })
}

const chatOutTranction = (data) => {
    console.log('Get Trasaction- '+ii);
    Outbox.getOneGlobal({
        kode_inbox:null,
        kode_transaksi:data.kode_transaksi
    }).then((e) => {
        if (e) {
            // kirimkan ke brouser
            data.socket.emit('chatOut',{
                username:data.penerima,
                pesan:e.pesan,
                tanggal:e.tgl_entri
            });

            // kirimkan ke provider
            data.msg.reply(e.pesan);

            // update ke database
            Outbox.update(e,data.penerima,data.terminal);

            // reset number
            ii = 1;
        }else{
            if (ii <= 120) {
                setTimeout(() => {
                    chatOutTranction(data);
                    ii++;
                }, 500);
            }else{
                ii = 1;
                console.log('melebihi batas permintaan');
            }
        }
    })
}

const getSession = async () => {
    return sessions;
}

const init = async (io) => {
    socket = io.of('/');

    await IMCenter.getAll({
        sender_speed:20,
        type:5
    }).then((e) => {
        socket.emit('message','Whatsapp ready');
        console.log('Lagi looping data whatsapp');
        e.forEach(element => {
            create(element);
        });
    })

    socket.on('addWhatsapp',(data) => {
        console.log('Create new whatsapp.');
        create(data);
    })
    
    socket.on('cancelScan', (status) => {
        if (status) {
            socket.emit('message', 'Scan QR canceled..');
            console.log('Scan QR canceled..');
        }
    })
    
    socket.on('sendMessageWhatsapp', (data) => {
        console.log('diterima oleh whatsapp',data);
        // const number = data.username;
        // const message = data.pesan;
      
        // const client = sessions.find(sess => sess.username == username).client;
      
        // client.sendMessage(number, message).then(response => {
        //   console.log(`Mengirimkan pesan ke ${number} berhasil`);
        // }).catch(err => {
        //     console.log(`Mengirimkan pesan ke ${number} gagal`,err);
        // });
    });
}

module.exports = {create,init,getSession};