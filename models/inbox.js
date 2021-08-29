'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class inbox extends Model {
    static associate({ outbox }) {
        this.hasOne(outbox, { foreignKey: 'kode_inbox', sourceKey: 'kode' })
    }

    // toJSON() {
    //   return { ...this.get(), id: undefined }
    // }
  }
  inbox.init(
    {
        kode: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tgl_entri: {
            type: DataTypes.DATE,
            defaultValue:sequelize.fn('GETDATE')
        },
        penerima: {
            type: DataTypes.STRING,
        },
        pengirim: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipe_pengirim: {
            type: DataTypes.TEXT('tiny'),
            allowNull: false,
        },
        pesan: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        kode_terminal: {
            type: DataTypes.INTEGER,
        },
        tgl_status: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('GETDATE'),
        },
        kode_reseller: {
            type: DataTypes.STRING,
        },
        kode_transaksi: {
            type: DataTypes.INTEGER,
        },
        is_jawaban: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_cs: {
            type: DataTypes.BOOLEAN,
        },
        kode_jawaban_cs: {
            type: DataTypes.INTEGER,
        },
        service_center: {
            type: DataTypes.STRING,
        },
        wrkirim: {
            type: DataTypes.BOOLEAN,
        },
        ex_kirim: {
            type: DataTypes.BOOLEAN,
        },
        timestamp: {
            type: DataTypes.BIGINT,
        },
        hash: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        tableName: 'inbox',
        modelName: 'inbox',
        timestamps: false,
        hasTrigger: true
    }
  )
  return inbox
}