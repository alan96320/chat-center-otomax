'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class reseller extends Model {
    // static associate({ outbox }) {
    //     this.hasOne(outbox, { foreignKey: 'pengirim', sourceKey: 'penerima' });
    // }
  }
  reseller.init(
    {
        kode:{
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement: false
        },
        nama:{
            type: DataTypes.STRING(50),
            allowNull: false,
    
        },
        saldo:{
            type: DataTypes.FLOAT ,
            defaultValue:0,
            allowNull: false,
    
        },
        alamat:{
            type: DataTypes.STRING(255),
    
        },
        pin:{
            type: DataTypes.STRING(10),
    
        },
        aktif:{
            type: DataTypes.BOOLEAN ,
            defaultValue:0,
            allowNull: false,
    
        },
        kode_upline:{
            type: DataTypes.STRING(20),
    
        },
        kode_level:{
            type: DataTypes.STRING(10),
            allowNull: false,
    
        },
        keterangan:{
            type: DataTypes.STRING(255),
    
        },
        tgl_daftar:{
            type: DataTypes.DATE ,
            defaultValue: sequelize.fn('GETDATE'),
    
        },
        saldo_minimal:{
            type: DataTypes.FLOAT ,
            defaultValue:0,
            allowNull: false,
    
        },
        tgl_aktivitas:{
            type: DataTypes.DATE,
    
        },
        pengingat_saldo:{
            type: DataTypes.FLOAT ,
            defaultValue:0,
    
        },
        f_pengingat_saldo:{
            type: DataTypes.BOOLEAN ,
            defaultValue:0,
            allowNull: false,
    
        },
        nama_pemilik:{
            type: DataTypes.STRING(50),
    
        },
        kode_area:{
            type: DataTypes.STRING(100),
    
        },
        tgl_pengingat_saldo:{
            type: DataTypes.DATE,
    
        },
        markup:{
            type: DataTypes.FLOAT,
    
        },
        wrkirim:{
            type: DataTypes.BOOLEAN,
    
        },
        wrkomisi:{
            type: DataTypes.INTEGER,
    
        },
        oid:{
            type: DataTypes.STRING(255),
    
        },
        poin:{
            type: DataTypes.INTEGER,
    
        },
        alamat_ip:{
            type: DataTypes.STRING(255),
    
        },
        password_ip:{
            type: DataTypes.STRING(255),
    
        },
        url_report:{
            type: DataTypes.STRING(255),
    
        },
        ex_kirim:{
            type: DataTypes.BOOLEAN,
    
        },
        tgl_data:{
            type: DataTypes.DATE,
    
        },
        kode_deposit:{
            type: DataTypes.INTEGER,
    
        },
        berita_transfer:{
            type: DataTypes.STRING(50),
    
        },
        fcmtoken:{
            type: DataTypes.TEXT,
    
        },
        deviceid:{
            type: DataTypes.STRING(100),
    
        },
        suspend:{
            type: DataTypes.BOOLEAN,
    
        },
        ip_no_sign:{
            type: DataTypes.BOOLEAN,
    
        },
        deleted:{
            type: DataTypes.BOOLEAN,
    
        },
        nomor_ktp:{
            type: DataTypes.STRING(50),
    
        },
        npwp:{
            type: DataTypes.STRING(50)
    
        }
    },
    {
        sequelize,
        tableName: 'reseller',
        modelName: 'reseller',
        timestamps: false,
        hasTrigger: true
    }
  )
  return reseller
}