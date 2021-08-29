'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class IMCenter extends Model {
    static associate({ inbox }) {
        this.hasMany(inbox, { 
            foreignKey: 'penerima',
            sourceKey: 'username',
        })
    }

    // toJSON() {
    //   return { ...this.get(), id: undefined }
    // }
  }
  IMCenter.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startup_login: {
        type: DataTypes.BOOLEAN,
      },
      connect_server: {
        type: DataTypes.STRING,
      },
      status_text: {
        type: DataTypes.STRING,
      },
      resource: {
        type: DataTypes.STRING,
      },
      ignore_offlines: {
        type: DataTypes.BOOLEAN,
      },
      use_ssl: {
        type: DataTypes.BOOLEAN,
      },
      use_compression: {
        type: DataTypes.BOOLEAN,
      },
      as_default: {
        type: DataTypes.BOOLEAN,
      },
      params: {
        type: DataTypes.STRING(4000),
      },
      label: {
        type: DataTypes.STRING,
      },
      sender_speed: {
        type: DataTypes.STRING,
        defaultValue: 10,
      },
      ex_kirim: {
        type: DataTypes.BOOLEAN,
      },
      filter_domain: {
        type: DataTypes.STRING,
      },
      kode_grup: {
        type: DataTypes.STRING,
      },
      domain_exclusion: {
        type: DataTypes.STRING,
      },
      filter_messages: {
        type: DataTypes.STRING,
      },
      tgl_data: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('GETDATE')
      },
    },
    {
        sequelize,
        tableName: 'im_center',
        modelName: 'IMCenter',
        timestamps: true,
        createdAt: false,
        updatedAt: false
    }
  )
  return IMCenter
}