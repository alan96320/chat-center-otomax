'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class APISender extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  APISender.init({
    kode: DataTypes.STRING,
    penerima: DataTypes.STRING,
    pengirim: DataTypes.STRING,
    pesan: DataTypes.STRING,
    type: DataTypes.STRING,
    price: DataTypes.INTEGER,
    saldoAwal: DataTypes.INTEGER,
    saldoAkhir: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'APISender',
  });
  return APISender;
};