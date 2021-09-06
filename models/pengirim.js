'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class pengirim extends Model {
    // static associate({ outbox }) {
    //     this.hasOne(outbox, { foreignKey: 'pengirim', sourceKey: 'penerima' });
    // }
  }
  pengirim.init(
    {
        pengirim: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            autoIncrement: false
        },
        tipe_pengirim: {
            type: DataTypes.TEXT('tiny'),
            allowNull: false,
        },
        kode_reseller: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        kirim_info: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        wrkirim: {
            type: DataTypes.BOOLEAN,
        },
        ex_kirim: {
            type: DataTypes.BOOLEAN,
        },
        tgl_data: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('GETDATE'),
        },
        username: {
            type: DataTypes.STRING,
        },
        terminal_proses: {
            type: DataTypes.STRING,
        },
        akses: {
            type: DataTypes.BOOLEAN,
        },
    },
    {
        sequelize,
        tableName: 'pengirim',
        modelName: 'pengirim',
        timestamps: false,
        hasTrigger: true
    }
  )
  return pengirim
}