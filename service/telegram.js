const Inbox = require('../controller/inboxController');
const Outbox = require('../controller/outboxController');
const TelegramBot = require('node-telegram-bot-api');
var sessionBot = [];

const authenticated = async (token) => {
    var res = null;
    var session = sessionBot.find(e => e.token == token);
    var bot;
    if (session == undefined) {
        bot = new TelegramBot(token);
    }else{
        bot = session.bot;
    }
    await bot.getMe().then(async (me) => {
        me.status = true;
        res = me;
    }).catch(async (err) => {
        console.log('error auth', err.response.body);
        res = {
            status: false,
            error: err.response.body
        };
    })
    return res;
}


const MyBot = async (token, socket, username) => {
    var session = sessionBot.find(e => e.token == token);
    if (session == undefined) {
        const bot = new TelegramBot(token,{polling: true});
        await bot.getMe().then(async (me) => {
            socket.emit('message', `Bot ${me.username} is connected...`);
            socket.emit('TelegramReady',{
                username: me.username,
            });
            sessionBot.push({
                token:token,
                bot:bot
            })
        }).catch(async (err) => {
            console.log('error auth', err);
        })

        bot.on('message', (msg) => {
            socket.emit('message', `In from: ${msg.from.first_name+' '+msg.from.last_name} || to: ${username} || message: ${msg.text}`);
            Inbox.add({
                penerima: username,
                pengirim: msg.from.first_name+' '+msg.from.last_name,
                type: 'y',
                pesan: msg.text
            }).then(e => {
                if (e) {
                    console.log(e.tgl_entri);
                    socket.emit('chatIn',{
                        username:username,
                        pesan:msg.text,
                        tanggal:e.tgl_entri
                    });
                    chatOut(msg,e,bot,socket);
                }
            });
            
        })
    }else{
        const bot = session.bot;
        await bot.getMe().then(async (me) => {
            socket.emit('message', `Bot ${me.username} is connected...`);
            socket.emit('TelegramReady',{
                username: me.username,
            });
        }).catch(async (err) => {
            console.log('error auth', err.response.body);
        })
    }
}

let i = 1;
const chatOut = (msg,data,bot,socket) => {
    console.log('percobaan ke- '+i);
    Outbox.getOne(data).then(e => {
        if (e) {
            socket.emit('chatOut',{
                username:data.penerima,
                pesan:e.pesan,
                tanggal:e.tgl_entri
            });
            socket.emit('message', `Out from: ${e.penerima} || to: ${data.pengirim} || message: ${e.pesan}`);
            bot.sendMessage(msg.chat.id, e.pesan,{
                reply_to_message_id:msg.message_id
            });
            Inbox.update(e);
            Outbox.update(e,data.penerima);
        }else{
            if (i <= 120) {
                setTimeout(() => {
                    chatOut(msg,data,bot,socket);
                    i++;
                }, 500);
            }else{
                i = 1;
                console.log('percobaan melebihi batas');
            }
        }
    })
}

module.exports = { MyBot,authenticated }