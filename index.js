const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const xmpp = require('simple-xmpp');
const CryptoJS = require("crypto-js");
const whatsapp = require('./service/whatsapp');
const jabbim = require('./service/jabbim');
const telegram = require('./service/telegram');
const ChromeLauncher = require('chrome-launcher');

const IMCenter = require('./controller/IMCenterController');
const Inbox = require('./controller/inboxController');
const Outbox = require('./controller/outboxController');
const Service = require('./service/myService');
const helper = require('./helpers/helpers');

var bodyParser = require('body-parser');
const {reseller,APISender,mutasi} = require('./models');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine', 'ejs');
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/fonts', express.static(path.join(__dirname, 'assets/fonts')));
app.use('/img', express.static(path.join(__dirname, 'assets/img')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('chat');
})

app.get('/service',(req,res) => {
    console.log('get in service');
})


// untuk api sender
app.post('/apiSender',async (req,res) => {
    try {
        var error = [];
        // untuk validasi apakah type kosong atau tidak
        if (req.body.type == "" || req.body.type == null || req.body.type == undefined) {
            error.push({
                field:'Type',
                message:'Type tidak boleh kosong',
            })
        }
        // untuk validasi apakah userId kosong atau tidak
        if (req.body.userId == "" || req.body.userId == null || req.body.userId == undefined) {
            error.push({
                field:'userId',
                message:'userId tidak boleh kosong',
            })
        }
        // untuk validasi apakah password kosong atau tidak
        if (req.body.password == "" || req.body.password == null || req.body.password == undefined) {
            error.push({
                field:'password',
                message:'password tidak boleh kosong',
            })
        }
        // untuk validasi apakah tujuan kosong atau tidak
        if (req.body.tujuan == "" || req.body.tujuan == null || req.body.tujuan == undefined) {
            error.push({
                field:'tujuan',
                message:'tujuan tidak boleh kosong',
            })
        }
        // untuk validasi apakah pesan kosong atau tidak
        if (req.body.pesan == "" || req.body.pesan == null || req.body.pesan == undefined) {
            error.push({
                field:'pesan',
                message:'pesan tidak boleh kosong',
            })
        }
        if (error.length > 0) {
            res.json({
                status:false,
                error:error
            });
        }else{
            var status = false;
            var message = null;
            var data = null;
            var number = req.body.type == 'wa' ? helper.phoneNumberFormatter(req.body.tujuan) : req.body.tujuan;
            var client = req.body.type == 'wa' ? await whatsapp.getSession() : await telegram.getSession();
            const random = Math.floor(Math.random() * client.length);
            var dt = await reseller.findOne({
                where:{
                    kode: req.body.userId
                }
            });
            if (dt != null) {
                // jika user id ditemukan langsung validasi berdasarkan pin 
                if (req.body.password == dt.pin) {
                    if (client.length > 0) {
                        client = client[random];
                        var center = client.client;
                        if (req.body.type == 'wa' || req.body.type == 'tele') {
                            var saldoAkhir = parseFloat(dt.saldo-process.env.PRICE_API_SENDER);
                            var numberIsregister = req.body.type == 'wa' ? await center.isRegisteredUser(number) : true;
                            var ket = 'API Sender '+req.body.type+' '+number;
                            if (numberIsregister) {
                                await center.sendMessage(number, req.body.pesan).then(async (e) =>{
                                    status =true;
                                    // update price
                                    await reseller.update({
                                        saldo: saldoAkhir
                                    },{
                                        where:{
                                            kode:req.body.userId
                                        }
                                    })
                                    await mutasi.create({
                                        kode_reseller:req.body.userId,
                                        jumlah:parseFloat('-'+process.env.PRICE_API_SENDER),
                                        keterangan:ket,
                                        jenis:'T',
                                        saldo_akhir: saldoAkhir,
                                        wrkirim:1
                                    });
                                    // masukan ke database
                                    await Outbox.insert({
                                        penerima: number,
                                        tipe_penerima: 'y',
                                        pesan: req.body.pesan,
                                        status: 20,
                                        kode_reseller: req.body.userId,
                                        pengirim: client.username,
                                        ex_kirim:1,
                                        kode_terminal:client.id
                                    })
                                    await APISender.create({
                                        kode: req.body.userId,
                                        penerima: number,
                                        pengirim: client.username,
                                        pesan: req.body.pesan,
                                        type:req.body.type,
                                        price: process.env.PRICE_API_SENDER,
                                        saldoAwal: parseFloat(dt.saldo),
                                        saldoAkhir: saldoAkhir
                                    })
                                    var jml = await APISender.findAll({
                                        where:{
                                            kode:req.body.userId,
                                            type:req.body.type
                                        }
                                    })
                                    data = {
                                        harga: process.env.PRICE_API_SENDER,
                                        message: `Berhasil mengirimkan pesan ke ${number.replace('@c.us','')} dengan pesan "${req.body.pesan}"`,
                                        jumlah: jml.length
                                    }
                                }).catch(err => {
                                    if (req.body.type == 'tele') {
                                        if (err.code == 'ETELEGRAM') {
                                            message = message="Nomor/ID "+number.replace('@c.us','')+" tujuan belum terdaftar di telegram";
                                        }else{
                                            message="Maaf, Terjadi kesalahan pada sistem, silahkan coba beberapa saat lagi.";
                                        }
                                    }else{
                                        message="Maaf, Terjadi kesalahan pada sistem, silahkan coba beberapa saat lagi.";
                                    }
                                    console.log(`Mengirimkan pesan ke ${number} gagal. Error Code:`,err.code);
                                    console.log(err);
                                });
                            }else{
                                message="Nomor/ID "+number.replace('@c.us','')+" tujuan belum terdaftar di whatsapp";
                            }
                        }else{
                            message="Type sender yang anda masukan tidak terdaftar."
                        }
                    }else{
                        message="Maaf, Service center lagi sibuk. Silahkan coba beberapa saat lagi.";
                    }
                }else{
                    message='User ID atau PIN yang anda masukan salah';
                }
            }else{
                message='User ID '+req.body.userId+' tidak di temukan.';
            }
    
            res.json({
                status:status,
                message:message,
                data:data
            });
        }
    } catch (error) {
        console.log(error);
    }


})

io.on('connection', async (socket) => {
    socket.emit('message', 'Socket is ready...');
    whatsapp.init(socket);
    jabbim.init(socket);
    telegram.init(socket);
    
    // untuk mengambil data
    socket.on('getData',(status) => {
        var params = {};
        params.sender_speed = 20;
        status == 'whatsapp' ? params.type = 5 : (status == 'jabbim' ? params.type = 3 : (status == 'telegram' ? params.type = 4 : ''));
        IMCenter.getAll(params).then((e) => {
            socket.emit('resGetData',{
                status:status,
                data:e
            })
        })
    })

    // untuk mengambil chatting
    socket.on('getChat', async (data) => {
        IMCenter.getOne({
            id:data.id
        }).then(e => {
            socket.emit('resGetChat', {
                username: data.username,
                data:e
            });
        })
    })
    
    socket.on('deleteAccount', async (data) => {
        await IMCenter.deleted({
            id:data.id
        }).then(async e => {
            await Inbox.deleted({
                penerima: data.username
            }).then(async e => {
                await Outbox.deleted({
                    pengirim: data.username
                }).then(e => {
                    socket.emit('resDeleteAccount', {
                        username: data.username,
                        type: data.type
                    })
                    if (data.type == 'whatsapp') {
                        whatsapp.abort(data.username);
                    }
                    if (data.type == 'telegram') {
                        telegram.abort(data.username);
                    }
                    if (data.type == 'jabbim') {
                        jabbim.logout(socket,data.username);
                    }
                })
            })
        })

    })

    socket.on('clearChat', async (data) => {
        await Inbox.deleted({
            penerima: data.username
        }).then(async e => {
            await Outbox.deleted({
                pengirim: data.username
            }).then(e => {
                socket.emit('resClearAccount', {
                    username: data.username
                })
            })
        })
    })

})


// socket untuk service
io.of('/service').on('connection', async (socket) => {
    console.log('Socket service connected.');
    io.of('/').emit('message','Socket Service connected.');
    socket.on('sendMessageWhatsapp', async (data) => {
        console.log(data.length);
        await whatsapp.getSession().then(ex => {
            if (ex.length > 0) {
                var WA = ex.find(e => e.username == data.username);
                var client = WA.client;
                var penerima = data.penerima.replace('whatsapp.net','c.us');
                client.sendMessage(penerima, data.pesan).then(async response => {
                    console.log('sukses mengirimkan pesan ke',penerima);
                    io.of('/').emit('chatOut',{
                        username:data.username,
                        pesan:data.pesan,
                        tanggal:data.tgl
                    });
                    await Outbox.update({
                        kode: data.idOutbox,
                        kode_inbox: data.idinbox,
                        terminal: data.idImcenter,
                        pengirim: data.username
                    });
                    if (data.idinbox != null) {
                        await Inbox.update({
                            kode_inbox: data.idinbox
                        })
                    }
                }).catch(err => {
                    console.log(`Mengirimkan pesan ke ${penerima} gagal`,err);
                });
            }
        })
    })
    socket.on('sendMessageJabbim', async (data) => {
        await jabbim.getSession().then(async (ex) => {
            if (ex.length > 0) {
                var jb = ex.find(e => e.username == data.username);
                var client = jb.client;
                client.send(data.penerima,data.pesan);
                io.of('/').emit('chatOut',{
                    username:data.username,
                    pesan:data.pesan,
                    tanggal:data.tgl
                });
                await Outbox.update({
                    kode: data.idOutbox,
                    kode_inbox: data.idinbox,
                    terminal: data.idImcenter,
                    pengirim: data.username
                });
                if (data.idinbox != null) {
                    await Inbox.update({
                        kode_inbox: data.idinbox
                    })
                }
            }
        });
    })
    socket.on('sendMessageTelegram', async (data) => {
        await telegram.getSession().then(async (ex) => {
            if (ex.length > 0) {
                var tele = ex.find(e => e.username == data.username);
                var client = tele.client;
                client.sendMessage(data.penerima, data.pesan);
                io.of('/').emit('chatOut',{
                    username:data.username,
                    pesan:data.pesan,
                    tanggal:data.tgl
                });
                await Outbox.update({
                    kode: data.idOutbox,
                    kode_inbox: data.idinbox,
                    terminal: data.idImcenter,
                    pengirim: data.username
                });
                if (data.idinbox != null) {
                    await Inbox.update({
                        kode_inbox: data.idinbox
                    })
                }
            }
        });
    })

    // untuk OTP
    socket.on('sendMessageOTP', async (data) => {
        var center = await whatsapp.getSession();
        const random = Math.floor(Math.random() * center.length);
        var number = data.penerima.replace('@whatsapp.net','')+'@c.us';
        if (center.length > 0) {
            center=center[random];
            var client = center.client;
            client.sendMessage(number, data.pesan).then(async response => {
                console.log('sukses mengirimkan pesan ke',number);
                await Outbox.update({
                    kode: data.idOutbox,
                    kode_inbox: data.idinbox,
                    pengirim: center.username,
                    terminal:null
                });
            }).catch(err => {
                console.log(`Mengirimkan pesan ke ${number} gagal`,err);
            });
        }
    })
})

server.listen(9000, function () {
    ChromeLauncher.launch({
        startingUrl: 'http://localhost:9000',
    }).then(chrome => {
        console.log('App running on: http://localhost:9000');
        console.log(`Chrome debugging port running on ${chrome.port}`);
        Service.statusService().then(e => {
            if (!e) {
                Service.install();
            }
        });
    });
})