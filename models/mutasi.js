'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class mutasi extends Model {
    // static associate({ inbox }) {
    //     this.hasMany(inbox, { 
    //         foreignKey: 'penerima',
    //         sourceKey: 'username',
    //     })
    // }

    // toJSON() {
    //   return { ...this.get(), id: undefined }
    // }
  }
  mutasi.init(
    {
      kode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      kode_reseller: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE'),
        allowNull: false,
      },
      jumlah: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      keterangan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      kode_reseller_2: {
        type: DataTypes.STRING,
      },
      jenis: {
        type: DataTypes.TEXT('tiny'),
      },
      kode_transaksi: {
        type: DataTypes.INTEGER,
      },
      kode_outbox: {
        type: DataTypes.INTEGER,
      },
      saldo_akhir: {
        type: DataTypes.FLOAT,
      },
      wrkirim: {
        type: DataTypes.BOOLEAN,
      },
      ex_kirim: {
        type: DataTypes.BOOLEAN,
      }
    },
    {
        sequelize,
        tableName: 'mutasi',
        modelName: 'mutasi',
        timestamps: false,
        hasTrigger: true
    }
  )
  return mutasi
}