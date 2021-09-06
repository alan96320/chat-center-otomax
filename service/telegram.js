const IMCenter = require('../controller/IMCenterController');
const Inbox = require('../controller/inboxController');
const Outbox = require('../controller/outboxController');
const TelegramBot = require('node-telegram-bot-api');
const CryptoJS = require("crypto-js");
var sessions = [];

const create = async (socket,data,createNew) => {
    var token = createNew ? data.token : CryptoJS.AES.decrypt(data.password, data.username).toString(CryptoJS.enc.Utf8),
        username = null,
        kode_terminal = createNew ? null : data.id;
    
    const bot = new TelegramBot(token,{polling: true});

    await bot.getMe().then(async (me) => {
        console.log('Telegram Ready:',me.username);
        socket.emit('message', `Bot ${me.username} is connected...`);
        socket.emit('TelegramReady',{
            username: me.username,
        });
        sessions.push({
            username: me.username,
            client: bot
        })
        username = me.username;
        if (createNew) {
            await IMCenter.add({
                label: data.label,
                token: data.token,
                username: me.username,
                startup: data.startup,
                type:'telegram'
            }).then(e => {
                kode_terminal=e.id;
                socket.emit('resAddTelegram',true);
            })
        }else{
            IMCenter.updateOne({id:kode_terminal},{
                status_text:'Online'
            });
        }
    }).catch(err => {
        console.log(err.code);
        if (!createNew) {
            socket.emit('message','Telegram Bot Token not provided!');
            IMCenter.updateOne({id:kode_terminal},{
                status_text:'Offline'
            });
        }
        socket.emit('resUpdateTelegram',false);
        bot.stopPolling();
    })

    bot.on('message', (msg) => {
        // console.log(msg);
        // // \n
        let dt = msg.text.split('\n');
        dt.forEach(text => {
            socket.emit('message', `In from: ${msg.from.id} || to: ${data.username} || message: ${text}`);
            Inbox.add({
                penerima: username,
                pengirim: msg.from.id,
                type: 'y',
                pesan: text,
                kode_terminal:kode_terminal
            }).then(e => {
                if (e) {
                    socket.emit('chatIn',{
                        username:username,
                        pesan:text,
                        tanggal:e.tgl_entri
                    });
                    // chatOut(msg,e,bot,socket,terminal);
                }
            });
        });
        
    })
}

const abort = async (username) => {
    var x = sessions.findIndex(e => e.username == username);
    if (x > -1) {
        var dt = sessions[index];
        dt.client.stopPolling();
        dt.client._polling.abort = true;
    }
}

const getSession = async () => {
    return sessions;
}

const init = async (socket) => {
    socket.emit('message', 'Sedang mempersiapkan telegram...');

    await IMCenter.getAll({
        sender_speed:20,
        type:4
    }).then((e) => {
        socket.emit('message','Telegram ready');
        e.forEach(element => {
            console.log('Create new session telegram',element.username);
            create(socket,element,false);
        });
    })

    socket.on('addTelegram',(data) => {
        console.log('Create new telegram.');
        create(socket,data,true);
    })

    socket.on('updateTelegram',(data) => {
        console.log(data);
        IMCenter.update(data).then(async e => {
            await abort(data.username);
            create(socket,e,false);
            socket.emit('resUpdateTelegram',true);
        })
    })
}

module.exports = { getSession, init, abort }