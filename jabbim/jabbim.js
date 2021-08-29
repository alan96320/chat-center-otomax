const CryptoJS = require("crypto-js");
const Inbox = require('../controller/inboxController');
const Outbox = require('../controller/outboxController');
function create(socket,data,conn) {
    var password = CryptoJS.AES.decrypt(data.password, data.label).toString(CryptoJS.enc.Utf8);
    var host = data.username.split('@')[1];
    conn.connect({
        "jid": data.username,
        "password": password,
        "host": host,
        "port": 5222
    });
    
    conn.on('online', function(e) {
        console.log('Connected with: '+e.jid.user);
        socket.emit('message', 'Connected with JID: ' + e.jid.user);
        socket.emit('resJabbimConn',{
            status: true,
            username:e.jid.user+'@'+e.jid._domain
        });
    });
    
    conn.on('chat', function(from, message) {
        socket.emit('message', 'In from: ' + from + ' || to: ' + data.username + ' || message: '+message);
        Inbox.add({
            penerima:data.username,
            pengirim:from,
            type:'g',
            pesan:message
        }).then(e => {
            if (e) {
                socket.emit('chatIn',{
                    username:e.penerima,
                    pesan:e.pesan,
                    tanggal:e.tgl_entri
                });
                chatOutJabbim(conn,socket,e);
            }
        });
    });
    
    conn.on('error', function(err) {
        socket.emit('message', 'Error Connected with JID: ' + data.username);
        socket.emit('message', err);
        socket.emit('resJabbimConn',{
            status: false,
            username:data.username
        });
        console.error(err);
    });
    
    conn.on('subscribe', function(from) {
        socket.emit('message', 'Added contact: ' + from);
        conn.acceptSubscription(from);
    });

    conn.on('close', function() {
        socket.emit('message', 'connection has been closed!');
        socket.emit('resJabbimConn',{
            status: false,
            username:data.username
        });
        console.log('connection has been closed!');
    });
    
    conn.getRoster();
}

function logout(socket,conn,user) {
    if (conn.conn.options.jid.user == user) {
        socket.emit('message', 'Disconnected with JID: ' + user);
        conn.disconnect();
    }
}
let i = 1;
function chatOutJabbim(conn,socket,data) {
    console.log('percobaan ke- '+i);
    Outbox.getOne(data).then(e => {
        if (e) {
            socket.emit('chatOut',{
                username:data.penerima,
                pesan:e.pesan,
                tanggal:e.tgl_entri
            });
            socket.emit('message', 'Out from: ' + data.penerima + ' || to: ' + data.pengirim + ' || message: '+e.pesan);
            conn.send(data.pengirim,e.pesan);
            Inbox.update(e);
            Outbox.update(e,data.penerima);
        }else{
            if (i <= 120) {
                setTimeout(() => {
                    chatOutJabbim(conn,socket,data);
                    i++;
                }, 500);
            }else{
                i = 1;
                console.log('percobaan melebihi batas');
            }
        }
    })
}

module.exports = {create,logout};