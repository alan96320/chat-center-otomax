const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const QR = require('qrcode');

let sessionCfg;
var client;
function create(socket) {
    const SESSION_FOLDER = 'whatsapp/session/';
    const SESSION_FILE_NAME = 'whatsapp-session.json';
    if (fs.existsSync(SESSION_FOLDER+SESSION_FILE_NAME)) {
        sessionCfg = require('./session/'+SESSION_FILE_NAME);
    }
    client = new Client({ puppeteer: { headless: true }, session: sessionCfg });
    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        QR.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'QR Code received, scan please!');
        });
    });

    client.on('authenticated', (session) => {
        console.log('AUTHENTICATED', session);
        sessionCfg=session;
        fs.writeFile(SESSION_FOLDER+SESSION_FILE_NAME, JSON.stringify(session), function (err) {
            if (err) {
                console.error(err);
            }
        });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    client.on('message', msg => {
        if (msg.body == '!ping') {
            msg.reply('pong');
        }
    });

    client.initialize();
}

module.exports = {create};