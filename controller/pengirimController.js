const { pengirim } = require('../models');
const helper = require('../helpers/helpers');
const CryptoJS = require("crypto-js");

const get = async (where) => {
    try {
        var data = await pengirim.findAll({ 
            where:where,
        });
        return data;
    } catch (err) {
        console.log(err);
    }
}

const add = async (params) => {
    try {
        var result = await pengirim.create(params);
        return result;
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    add,
    get
}
