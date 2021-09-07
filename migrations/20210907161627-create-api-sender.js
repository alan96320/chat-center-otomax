'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('APISenders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode: {
        allowNull: false,
        type: Sequelize.STRING
      },
      penerima: {
        allowNull: false,
        type: Sequelize.STRING
      },
      pengirim: {
        allowNull: false,
        type: Sequelize.STRING
      },
      pesan: {
        allowNull: false,
        type: Sequelize.STRING
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      price: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      saldoAwal: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      saldoAkhir: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('APISenders');
  }
};