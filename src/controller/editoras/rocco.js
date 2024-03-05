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

	let filtros = Array.from(Array(26)).map((e, i) => i + 65).map((x) => String.fromCharCode(x));
	filtros = [...editora.filtros, ...filtros];

	for await (const filtro of filtros) {
		await page.goto(editora.url+filtro);
		console.log(`Acessando a página ${editora.url+filtro}`);

		let links = [];
		let hasNext = true;

		do {
			links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))));

			hasNext = await page.$(editora.next_page);
			if(hasNext) await page.click(editora.next_page);

			await page.waitForSelector(editora.link_pagina);

		} while (hasNext);

		let isbns = [];


		for await(const link of links){
			console.log(`Salvando link: ${link}`);
			await page.goto(link, {waitUntil: 'load'});

			await page.waitForSelector(editora.isbn);

			isbns.push(await page.$eval('.vendas-ficha-tecnica p', el => el.innerText));

			let isbn = await page.$eval('.vendas-ficha-tecnica p', el => el.innerText);
			let autor = await page.$eval('.autor_livro a', el => el.innerText.toLowerCase()).catch(() => null);
			let titulo = await page.$eval('.titulo_livro', el => el.innerText.toLowerCase()).catch(() => null);
			let assunto = await page.$eval('.desc_assunto', el => el.innerText.toLowerCase()).catch(() => null);

			isbn = parserISBN(isbn);
			titulo = string(titulo);
			autor = parserAutor(autor);
			assunto = string(assunto);

			let dados = {
				editora: editora.editora,
				link,
			};

			if(isbn) dados.ISBN = isbn;
			if(titulo) dados.titulo = titulo;
			if(autor) dados.autor = autor;
			if(assunto) dados.assunto = assunto;

      
			if(isbn){
				await Livros.upsert(dados).catch(err => console.log(err));
			} else {
				await Erros.create({
					link
				});
			}
		}
	}
};

module.exports = scrapper;