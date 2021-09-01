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
        Inbox.add({
            penerima:data.username,
            pengirim:from,
            service_center:data.username,
            type:'g',
            pesan:message
        }).then(e => {
            if (e) {
                socket.emit('chatIn',{
                    username:e.penerima,
                    pesan:e.pesan,
                    tanggal:e.tgl_entri
                });
                chatOutJabbim(conn,socket,e,data.id);
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
        console.log('ada permintaan',from);
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
function chatOutJabbim(conn,socket,data,terminal) {
    console.log('percobaan ke- '+i);
    Outbox.getOne(data).then(async e => {
        if (e) {
            socket.emit('chatOut',{
                username:data.penerima,
                pesan:e.pesan,
                tanggal:e.tgl_entri
            });
            socket.emit('message', 'Out from: ' + data.penerima + ' || to: ' + data.pengirim + ' || message: '+e.pesan);
            conn.send(data.pengirim,e.pesan); // balasan ke jabbim
            await Inbox.update(e); // update inbox
            await Outbox.update(e,data.penerima,terminal); // update outbox
            i = 1;
            if (e.kode_transaksi != null) {
                chatOutTranction({
                    kode_transaksi:e.kode_transaksi,
                    penerima:data.penerima,
                    pengirim:data.pengirim,
                    conn:conn,
                    socket:socket,
                    terminal:terminal
                });
            }
        }else{
            if (i <= 120) {
                setTimeout(() => {
                    chatOutJabbim(conn,socket,data,terminal);
                    i++;
                }, 500);
            }else{
                i = 1;
                console.log('percobaan melebihi batas');
            }
        }
    })
}

const chatOutTranction = (data) => {
    console.log('Get Trasaction- '+i);
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
            data.conn.send(data.pengirim,e.pesan);

            // update ke database
            Outbox.update(e,data.penerima,data.terminal);

            // reset number
            i = 1;
        }else{
            if (i <= 120) {
                setTimeout(() => {
                    chatOutTranction(data);
                    i++;
                }, 500);
            }else{
                i = 1;
                console.log('melebihi batas permintaan');
            }
        }
    })
}

module.exports = {create,logout};