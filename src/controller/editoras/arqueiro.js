const Livros = require('../../model/Livros');
const Erros = require('../../model/Erros');
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

	await page.goto(editora.url);

	let links = [];
	let hasNext = 1;

	do {
		await page.waitForSelector('.pagination .next');
		console.log(`Acessando a página ${page.url()}`);

		links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))));

		hasNext = (await page.$$(editora.next_page)).length;
		if(hasNext) await page.click(editora.next_page);
        
	} while (hasNext);

	for await(const link of links){
		await page.goto(link);
		console.log(`Salvando link: ${link}`);
        
		try {
			let isbnTitulo = await page.$eval('.subCat', el => el.innerText).catch(() => null);
			let autor = await page.$eval('.nome', el => el.innerText).catch(() => null);
            
			let isbn = isbnTitulo.match(editora.regex_isbn);
			let titulo = isbnTitulo.match(editora.regex_titulo);

			isbn = parserStringRegex(isbnTitulo, editora.regex_isbn);
			titulo = parserStringRegex(titulo, editora.regex_titulo);
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
		} catch (error) {
			console.log(error);
		}
        
	}
};

module.exports = scrapper;