const Livros = require('../../model/Livros');
const Erros = require('../../model/Erros');
const { string } = require('../../utils');
const { parserISBN, parserStringRegex, parserAutor } = require('../../utils/parser');

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

	await page.waitForSelector('.pager_last');

	const lastPage = Number.parseInt(await page.$eval('.pager_last', el => el.href.replaceAll('http://martinclaret.com.br/catalogo/page/', '').replaceAll('/', '')));
	let links = [];

	do {
		console.log(`Acessando a página ${page.url()}`);
		await page.waitForSelector('#pagination');

		links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))));
		pagination++;

		await page.goto(editora.url+pagination);
	} while (pagination != lastPage);

	try {
		for await(const link of links){
			await page.goto(link);
			console.log(`Salvando link: ${link}`);
        
			let isbn = await page.$eval('.product', el => el.className).catch(() => null);
			let titulo = await page.$eval('.product_title', el => el.innerText).catch(() => null);
			let autor = await page.$eval('.product-author a', el => el.innerText).catch(() => null);

			isbn = parserStringRegex(isbn, editora.regex_isbn);
			titulo = string(titulo);
			autor = parserStringRegex(autor, editora.regex_autor);

			let dados = {
				editora: editora.editora,
				link,
			};

			if(isbn) dados.ISBN = parserISBN(isbn);
			if(titulo) dados.titulo = titulo;
			if(autor) dados.autor = parserAutor(autor);

			try {
				if(isbn){
					await Livros.upsert(dados).catch(err => console.log(err));
				} else {
					throw 'error';
				}
			} catch (error) {
				await Erros.create({
					link
				});
				console.log(error);
			}
		}
	} catch (error) {
		console.log(error);

	}
};

module.exports = scrapper;