const { IMCenter, inbox, outbox } = require('../models');

const getOne = async (data) => {
    try {
        var result = await outbox.findOne({ 
            where:{
                kode_inbox:data.kode,
            }
        });
        return result;
    } catch (err) {
        console.log(err);
    }
}

const update = async (data) => {
    try {
        var result = await outbox.update(
            {
                status:20,
                pengirim: data.pengirim,
                kode_terminal: data.terminal,
                ex_kirim:1,
                kode_inbox: data.kode_inbox
            },{
                where:{
                    kode:data.kode
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
        var result = await outbox.destroy({
            where:where
        });
        return result;
    } catch (err) {
        console.log(err);
    }
}

const getOneGlobal = async (where) => {
    try {
        var result = await outbox.findAll({ 
            where:where,
            include: [{
                model:IMCenter
            }]
        });
        return result;
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getOne,
    update,
    deleted,
    getOneGlobal
}