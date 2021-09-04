var fs = require('fs');
const path = require('path');
const io = require('socket.io-client');
const socket = io('http://localhost:8000/service');
const { Op } = require("sequelize");
const { IMCenter, inbox, outbox } = require('./models');

setInterval(async() => {
    try {
        var data = await outbox.findAll({ 
            where:{
                tipe_penerima:{
                    [Op.in]: ['y', 'Y', 'g', 'G']
                },
                wrkirim:{
                    [Op.is]: null,
                },
            },
            include: [{
                model:IMCenter,
                where:{
                    sender_speed:20
                },
            }]
        });
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