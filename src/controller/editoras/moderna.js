const Livros = require('../../model/Livros');
const Erros = require('../../model/Erros');
const { string } = require('../../utils');
const { parserISBN, parserStringRegex, parserAutor } = require('../../utils/parser');

const scrapper = async (page, editora) => {

	let pagination = 1;
	await page.goto(editora.url+pagination);

	await page.waitForSelector('.Paginacao');

	const lastPage = (await page.$$eval('.Paginacao li>button:not(.arrowButton)', el => el.map(text => text.innerText))).length;
	let links = [];

	do {
		console.log(`Acessando a página ${page.url()}`);
		await page.waitForSelector('.Paginacao');

		links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))));
		pagination++;

		await page.goto(editora.url+pagination);
	} while (pagination != lastPage);

	await page.setRequestInterception(true);
	page.on('request', (request) => {
		if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
			request.abort();
		} else {
			request.continue();
		}
	});
	
	try {
		for await(const link of links){
			
			await page.goto(link);
			console.log(`Salvando link: ${link}`);
        
			let isbn = await page.$eval('.detalhes>ul', el => el.innerText).catch(() => null);
			let titulo = await page.$eval('.cabecalho>h2', el => el.innerText).catch(() => null);
			let autor = await page.$eval('.content>p', el => el.innerText).catch(() => null);

			isbn = parserStringRegex(isbn, editora.regex_isbn);
			titulo = string(titulo);
			autor = parserAutor(autor);

			let dados = {
				editora: editora.editora,
				link,
			};

			if(isbn) dados.ISBN = parserISBN(isbn);
			if(titulo) dados.titulo = titulo;
			if(autor) dados.autor = autor;

			if(isbn){
				await Livros.upsert(dados).catch(err => console.log(err));
			} else {
				await Erros.create({
					link
				});
			}
		}
	} catch (error) {
		console.log(error);
	}
};

module.exports = scrapper;