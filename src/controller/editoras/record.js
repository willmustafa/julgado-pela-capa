const Livros = require('../../model/Livros');
const Erros = require('../../model/Erros');
const { string } = require('../../utils');
const { parserISBN, parserAutor } = require('../../utils/parser');

const scrapper = async (page, editora) => {

	await page.setRequestInterception(true);
	page.on('request', (request) => {
		if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
			request.abort();
		} else {
			request.continue();
		}
	});

	let pagination = 1;
	await page.goto(editora.url+pagination);

	const lastPage = await page.$eval('.page-numbers li:nth-last-child(2)>a', el => el.innerText);
	let links = [];

	do {
		console.log(`Acessando a página ${page.url()}`);
		await page.waitForSelector('.page-numbers');

		links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))));
		pagination++;

		await page.goto(editora.url+pagination);
	} while (String(pagination) != lastPage);

	for await(const link of links){
		await page.goto(link);
		console.log(`Salvando link: ${link}`);
        
		try {
			let isbn = await page.$eval('.book-char>.book-char__item>.book-char__value', el => el.innerText).catch(() => null);
			let titulo = await page.$eval('.product_title', el => el.innerText).catch(() => null);
			let autor = await page.$eval('.book-author__title', el => el.innerText).catch(() => null);

			isbn = parserISBN(isbn);
			titulo = string(titulo);
			autor = parserAutor(autor);

			let dados = {
				editora: editora.editora,
				link,
			};

			if(isbn) dados.ISBN = isbn;
			if(titulo) dados.titulo = titulo;
			if(autor) dados.autor = autor;

			if(isbn){
				await Livros.upsert(dados).catch(err => console.log(err));
			} else {
				await Erros.create({
					link
				});
			}
		} catch (error) {
			console.log(error);
		}
        
	}
};

module.exports = scrapper;