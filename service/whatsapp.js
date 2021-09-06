const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const QR = require('qrcode');
const IMCenter = require('../controller/IMCenterController');
const Inbox = require('../controller/inboxController');
const Outbox = require('../controller/outboxController');
const pengirim = require('../controller/pengirimController');
const { Op } = require("sequelize");
const SESSION_FOLDER = 'service/session/';

let i = 1;
const sessions = [];

function create(socket,data){
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

    client.on('ready', async() => {
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
                    await IMCenter.add({
                        type: 'whatsapp',
                        username: info.me._serialized,
                        label: info.me.user,
                        startup: 'on'
                    }).then(e => {
                        id = e.id;
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

                IMCenter.updateOne({id:id},{
                    status_text:'Online'
                });
            }
        }
    });

    client.on('message',async msg => {
        var number = msg.from.replace('@c.us','');
        await pengirim.get({
            tipe_pengirim:'y',
            pengirim:{
                [Op.like]: '%'+number+'%',
            }
        }).then(async e => {
            if (e.length > 0) {
                var fine = e.find(ex => ex.pengirim == msg.from);
                var datax = e.find(ex => ex.pengirim.search('@whatsapp.net') > -1);
                if (!fine) {
                    if (datax) {
                        datax = typeof(datax) === 'object' ? datax : datax[0];
                        await pengirim.add({
                            pengirim:msg.from,
                            tipe_pengirim:'y',
                            kode_reseller:datax.kode_reseller,
                            kirim_info:datax.kirim_info,
                            wrkirim:datax.wrkirim
                        })
                    } else {
                        msg.reply('Nomor anda belum terdaftar / Anda Bukan Reseller');
                    }
                }
            } else {
                msg.reply('Nomor anda belum terdaftar / Anda Bukan Reseller');
            }
        })
        let dt = msg.body.split('\n');
        dt.forEach(element => {
            Inbox.add({
                penerima:msg.to,
                pengirim:msg.from,
                type:'y',
                pesan:element,
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
    });

    client.on('disconnected', (reason) => {
        console.log(reason);
        socket.emit('message', 'Whatsapp is disconnected!');
        if (reason == 'NAVIGATION') {
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
                destroy:true,
                username:info.me._serialized
            })
        }
        IMCenter.updateOne({id:id},{
            status_text:'Offline'
        });

        socket.emit('disconedWhatsapp',{
            destroy:false,
            username:info.me._serialized
        })
        client.destroy();
    });

    client.initialize();
}

const getSession = async () => {
    return sessions;
}

const abort = async (username) => {
    var i = sessions.findIndex(e => e.username == username);
    if (i > -1) {
        var client = sessions[i].client;
        client.destroy();
        sessions.splice(i,1);
    }
    fs.unlinkSync(`${SESSION_FOLDER}whatsapp-session-${username}.json`, function(err) {
        if(err) return console.log(err);
    });
}

const init = async (socket) => {
    socket.emit('message', 'Sedang mempersiapkan whatsapp...');

    await IMCenter.getAll({
        sender_speed:20,
        type:5
    }).then((e) => {
        socket.emit('message','Whatsapp ready');
        e.forEach(element => {
            console.log('Create new session whatsapp',element.username);
            create(socket,element);
        });
    })

    socket.on('addWhatsapp',(data) => {
        console.log('Create new whatsapp.');
        create(socket,data);
    })
    
    socket.on('cancelScan', (status) => {
        if (status) {
            socket.emit('message', 'Scan QR canceled..');
            console.log('Scan QR canceled..');
        }
    })

    socket.on('updateWhatsapp',(data) => {
        IMCenter.update(data).then(async e => {
            create(socket,e,false);
            socket.emit('resUpdateWhatsapp',true);
        })
    })
    
}

module.exports = {create,init,getSession,abort};