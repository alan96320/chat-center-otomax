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

const update = async (data,pengirim) => {
    try {
        var result = await outbox.update(
            {
                status:20,
                pengirim:pengirim
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
        var result = await outbox.destroy({
            where:where
        });
        return result;
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    getOne,
    update,
    deleted
}