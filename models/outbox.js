'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class outbox extends Model {
    static associate({ IMCenter }) {
      this.hasOne(IMCenter, { foreignKey: 'username', sourceKey: 'pengirim'})
    }

    // toJSON() {
    //   return { ...this.get(), id: undefined }
    // }
  }
  outbox.init(
    {
        kode: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tgl_entri: {
            type: DataTypes.DATEONLY,
            defaultValue: sequelize.fn('GETDATE'),
        },
        penerima: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipe_penerima: {
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
        tgl_status: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('GETDATE'),
        },
        kode_inbox: {
            type: DataTypes.INTEGER,
        },
        kode_transaksi: {
            type: DataTypes.INTEGER,
        },
        kode_reseller: {
            type: DataTypes.STRING,
        },
        bebas_biaya: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_perintah: {
            type: DataTypes.BOOLEAN,
        },
        kode_modul: {
            type: DataTypes.INTEGER,
        },
        prioritas: {
            type: DataTypes.BOOLEAN,
        },
        modul_proses: {
            type: DataTypes.STRING,
        },
        pengirim: {
            type: DataTypes.STRING,
        },
        kode_terminal: {
            type: DataTypes.INTEGER,
        },
        wrkirim: {
            type: DataTypes.BOOLEAN,
        },
        ex_kirim: {
            type: DataTypes.BOOLEAN,
        },
        ctr_kirim: {
            type: DataTypes.BOOLEAN,
        },
    },
    {
        sequelize,
        tableName: 'outbox',
        modelName: 'outbox',
        timestamps: false,
        hasTrigger: true
    }
  )
  return outbox
}