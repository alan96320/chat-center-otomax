'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class pengirim extends Model {
    // static associate({ pengirim }) {
    //   this.hasMany(pengirim, { foreignKey: 'userId', as: 'posts' })
    // }

    // toJSON() {
    //   return { ...this.get(), id: undefined }
    // }
  }
  pengirim.init(
    {
        pengirim: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        tipe_pengirim: {
            type: DataTypes.TEXT('tiny'),
            allowNull: false,
            primaryKey: true,
        },
        kode_reseller: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        kirim_info: {
            type: DataTypes.TEXT('tiny'),
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