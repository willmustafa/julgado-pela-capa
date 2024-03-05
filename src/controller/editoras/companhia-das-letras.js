const Livros = require('../../model/Livros');
const Erros = require('../../model/Erros');
const { string } = require('../../utils');
const { parserAutor } = require('../../utils/parser');

const range = ({from = 0, to, step = 1, length = Math.ceil((to - from) / step)}) => 
	Array.from({length}, (_, i) => from + i * step);

const scrapper = async (page, editora) => {
	const queryAnos = editora?.query_ano ? new Date().getFullYear() - editora.query_ano_min + 1 : 1;
	const url = editora?.query_ano ? editora.url + editora.query_ano : editora.url;

	await page.setRequestInterception(true);
	page.on('request', (request) => {
		if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
			request.abort();
		} else {
			request.continue();
		}
	});

	let isbnList = [];

	for await (const year of range({from: editora.query_ano_min, length: queryAnos})) {
        
		await page.goto(url+year);
		console.log(`Acessando a página ${url+year}`);

		let fila = await page.$eval('#fila', el => el.value.split(','));
		let mostrando = await page.$eval('#mostrando', el => el.value.split(','));
		let isbns = [...fila, ...mostrando].filter(el => el != '');

		isbnList.push(...isbns);
	}


	for await (const isbn of isbnList) {
		console.log(`Acessando a página ${editora.book_url+isbn}`);
		await page.goto(editora.book_url+isbn);

		try {
			let titulo = await page.$eval('.detalhe_livro_titulo', el => el.innerText).catch(() => null);
			let autor = await page.$eval('.detalhe_livro_autor>a', el => el.innerText).catch(() => null);

			titulo = string(titulo);
			autor = parserAutor(autor);

			let dados = {
				editora: editora.editora,
				link: editora.book_url+isbn,
				ISBN: isbn,
			};

			if(titulo) dados.titulo = titulo;
			if(autor) dados.autor = autor;


			if(isbn){
				await Livros.upsert(dados).catch(err => console.log(err));
			} else {
				await Erros.create({
					link: editora.book_url+isbn,
				});
			}
		} catch (error) {
			console.log(error);
		}
	}


};

module.exports = scrapper;