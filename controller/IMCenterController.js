const { IMCenter, inbox, outbox } = require('../models');
const helper = require('../helpers/helpers');
const CryptoJS = require("crypto-js");

const getAll = async (where) => {
    try {
        var data = await IMCenter.findAll({ 
            where:where
        });
        return data;
    } catch (err) {
        console.log(err);
    }
}

const add = async (data) => {
    try {
        var params = {};
        params.type = data.type == 'jabbim' ? 3 : (data.type == 'telegram' ? 4 : 5);
        params.username = data.username;
        if (data.type == 'jabbim') {
            params.password = CryptoJS.AES.encrypt(data.password, data.label).toString();
            params.resource = data.resource;
        }
        if (data.type == 'whatsapp') {
            params.username = data.username;
            params.password = CryptoJS.AES.encrypt(data.username, data.label).toString();
            params.status_text = 'Online';
        }
        if (data.type == 'telegram') {
            params.password = CryptoJS.AES.encrypt(data.token, data.username).toString();
        }
        params.startup_login = data.startup == 'on' ? true : false;
        params.label = data.label;
        var result = await IMCenter.create(params);
        return result;
    } catch (err) {
        console.log(err);
    }
}

const update = async (data) => {
    try {
        var params = {};
        if (data.type == 'jabbim') {
            params.username = data.username;
            if (data.password == null || data.password == "" || data.password == undefined){
                params.password = CryptoJS.AES.encrypt(data.password, data.label).toString();
            }
            params.startup_login = data.startup == 'on' ? true : false;
            params.resource = data.resource;
        }
        if (data.type == 'telegram') {
            if (params.password != null) {
                params.password = CryptoJS.AES.encrypt(data.token, data.username).toString();
            }
            params.startup_login = data.startup == 'on' ? true : false;
        }
        params.label = data.label;
        
        var result = await IMCenter.update(params,{
            where:{
                id:data.id
            }
        });
        result = await IMCenter.findOne({
            where:{
                id:data.id
            }
        });
        return result;
    } catch (err) {
        console.log(err);
    }
}

const deleted = async (where) => {
    try {
        var result = await IMCenter.destroy({
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
