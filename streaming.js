var fs = require('fs');
const path = require('path');
const io = require('socket.io-client');
const socket = io('http://localhost:8000/service');
const { Op } = require("sequelize");
const { IMCenter, inbox, outbox } = require('./models');
const moment = require('moment');

setInterval(async() => {
    try {
        var today = moment(new Date().toUTCString()).format();
        var data = await outbox.findAll({ 
            where:{
                tipe_penerima:{
                    [Op.in]: ['y', 'Y', 'g', 'G']
                },
                ex_kirim:{
                    [Op.is]: null,
                },
                tgl_entri:{
                    [Op.gt]: today
                },
            },
            include: [{
                model:IMCenter,
                where:{
                    sender_speed:20
                },
            }]
        });
        // data = data.map(e => {
        //     return e.penerima;
        // })
        // console.log(data);
        if (data.length > 0) {
            data.forEach(element => {
                if (element.IMCenter) {
                    if (element.IMCenter.type == 5) {
                        console.log('lagi megirimkan ke whtasapp');
                        socket.emit('sendMessageWhatsapp',{
                            username:element.IMCenter.username,
                            pesan:element.pesan,
                            idOutbox:element.kode,
                            idImcenter:element.IMCenter.id,
                            penerima:element.penerima,
                            idinbox:element.kode_inbox
                        })
                    }
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
}, 5000);