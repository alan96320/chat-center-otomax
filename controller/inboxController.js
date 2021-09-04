const { IMCenter, inbox, outbox } = require('../models');

const getAll = async (where) => {
    try {
        var result = await inbox.findAll({ 
            where:where,
            include: [{
                model:outbox
            }]
        });
        return result;
    } catch (err) {
        console.log(err);
    }
}

const add = async (data) => {
    try {
        var params = {};
        params.penerima = data.penerima;
        params.pengirim = data.pengirim;
        params.tipe_pengirim = data.type;
        params.pesan = data.pesan;
        params.service_center = data.service_center;
        params.kode_terminal = data.kode_terminal;
        var result = await inbox.create(params);
        return result;
    } catch (err) {
        console.log(err);
    }
}

const update = async (data) => {
    try {
        var result = await inbox.update(
            {
                status:20,
            },{
                where:{
                    kode:data.kode_inbox
                }
            }
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

const deleted = async (where) => {
    try {
        var result = await inbox.destroy({
            where:where
        });
        return result;
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getAll,
    add,
    update,
    deleted
}