const Sequelize = require('sequelize');
const database = require('../database');

const Erros = database.define("Erros", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },
    link: {
      type: Sequelize.STRING,
    },
});

module.exports = Erros