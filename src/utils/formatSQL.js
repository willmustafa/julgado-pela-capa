const Livros = require('../model/Livros');
const { parserStringRegex } = require('./parser');

const clearSQL = async () => {
	const removeIlustrador = /(.*)(?=\n)/m;

	const response = await Livros.findAll({
		raw: true,
	});

	for await(const livro of response){
		let clearedAutor = '';
		let dados = {};

		if(livro.autor) clearedAutor = parserStringRegex(livro.autor, removeIlustrador);

		if(livro.autor && clearedAutor) dados.autor = clearedAutor;

		if(Object.keys(dados).length) {

			await Livros.update(dados, {
				where: {
					id: livro.id
				}
			});
		}
	}

};

module.exports = clearSQL;