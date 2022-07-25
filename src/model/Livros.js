const Sequelize = require('sequelize');
const database = require('../database/');

const Livros = database.define("Livros", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT,
    },
    ISBN: {
      type: Sequelize.BIGINT,
      allowNull: false,
      unique: true,
    },
    editora: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    link: {
      type: Sequelize.STRING,
    },
    autor: {
      type: Sequelize.STRING,
    },
    titulo: {
      type: Sequelize.STRING,
    },
    data_publicacao: {
      type: Sequelize.STRING,
    },
    assunto: {
      type: Sequelize.STRING,
    },
});

module.exports = Livros