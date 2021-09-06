const CryptoJS = require("crypto-js");
const Inbox = require('../controller/inboxController');
const IMCenter = require('../controller/IMCenterController');
const xmpp = require('simple-xmpp');

const sessions = [];
function create(socket,data,dataNew) {
    var conn = new xmpp.SimpleXMPP();
    var password = CryptoJS.AES.decrypt(data.password, data.username).toString(CryptoJS.enc.Utf8);
    var host = data.username.split('@')[1];
    var id = data.id;
    conn.connect({
        "jid": data.username,
        "password": password,
        "host": host,
        "port": 5222
    });
    
    conn.on('online', function(e) {
        console.log('Jabbim ready: '+e.jid.user);
        socket.emit('message', 'Connected with JID: ' + e.jid.user);
        var username = e.jid.user+'@'+e.jid._domain;
        socket.emit('jabbimConnect',{
            status: true,
            username:username
        });
        IMCenter.updateOne({id:id},{
            status_text:'Online'
        });
        sessions.push({
            username: username,
            client: conn
        });
        if (dataNew) {
            socket.emit('resAddJabbim',true);
        }
    });
    
    conn.on('chat', function(from, message) {
        Inbox.add({
            penerima:data.username,
            pengirim:from,
            service_center:data.username,
            type:'g',
            pesan:message,
            kode_terminal:id
        }).then(e => {
            if (e) {
                socket.emit('chatIn',{
                    username:e.penerima,
                    pesan:e.pesan,
                    tanggal:e.tgl_entri
                });
            }
        });
    });
    
    conn.on('error', function(err) {
        socket.emit('message', 'Error Connected with JID: ' + data.username);
        socket.emit('message', err);
        socket.emit('jabbimConnect',{
            status: false,
            username:data.username
        });
        IMCenter.updateOne({id:id},{
            status_text:'Offline'
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
        IMCenter.updateOne({id:id},{
            status_text:'Offline'
        });
        console.log('connection has been closed!');
    });
    
    conn.getRoster();
}

async function logout(socket,username) {
    var index = sessions.findIndex(e => e.username == username);
    if (index > -1) {
        var dt = sessions[index];
        console.log('Disconnected with JID: ' + username);
        socket.emit('message', 'Disconnected with JID: ' + username);
        dt.client.disconnect();
        sessions.splice(index,1);
    }
}

const getSession = async () => {
    return sessions;
}

const init = async (socket) => {
    socket.emit('message', 'Sedang mempersiapkan jabbim...');
    await IMCenter.getAll({
        sender_speed:20,
        type:3
    }).then((e) => {
        socket.emit('message','Jabbim ready');
        e.forEach(element => {
            console.log('Create new session jabbim',element.username);
            create(socket,element,false);
        });
    })

    socket.on('addJabbim',(data) => {
        console.log('Create new jabbim.',data.username);
        IMCenter.add(data).then(e => {
            create(socket,e,true);
        })
    })

    socket.on('updateJabbim', (data) => {
        IMCenter.update(data).then(async e => {
            await logout(socket,e.username);
            create(socket,e,false);
            socket.emit('resUpdatejabbim',true);
        })
    })
}

module.exports = {getSession,init,logout};