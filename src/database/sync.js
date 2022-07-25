const Sequelize = require("sequelize");
const database = require("./index");

// Importa os modelos disponíveis na API
const models = require("../model/");

(async () => {
  try {
    await database.sync({ alter: true });
  } catch (error) {
    console.error("Falhou em iniciar o banco de dados");
    console.log(error);
  }
})();
