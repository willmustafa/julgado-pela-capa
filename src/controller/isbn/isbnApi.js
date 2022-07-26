const axios = require('axios');
const Livros = require('../../model/Livros');
const { string, dateFormat } = require('../../utils');

const isbnCblApi = async () => {
    
	const livrosDB = await Livros.findAll({
		where: {
			cbl_encontrado: null
		},
		raw: true
	});
	console.log(`Encontrado ${livrosDB.length} livros para pesquisar na CBL.`);

	for await (const livro of livrosDB){

		const response = await axios({
			method: 'POST',
			url: 'https://isbn-search-br.search.windows.net/indexes/isbn-index/docs/search?api-version=2016-09-01',
			headers: {
				'api-key': '100216A23C5AEE390338BBD19EA86D29'
			},
			data: {
				searchMode:'any',
				searchFields:'FormattedKey,RowKey',
				queryType:'full',
				search: livro.ISBN,
				top:100,
				select:'Authors,Colection,Countries,Date,Imprint,Title,RowKey,PartitionKey,RecordId,FormattedKey,Subject,Veiculacao,Ano',
				skip:0,
				count:true,
				filter:'',
				orderby:null,
				facets:['Imprint,count:50','Authors,count:50']
			}
		}).then(res => res.data).catch(error => console.log(error.response));

		if(response['@odata.count']){

			let autor = string(response.value[0].Authors);
			let titulo = string(response.value[0].Title);
			let assunto = string(response.value[0].Subject);
			let pais = string(response.value[0].Countries);
			let date = dateFormat(response.value[0].Date);

			let uploadData = { cbl_encontrado: true};

			if (autor && !livro.autor) uploadData.autor = autor;
			if (titulo && !livro.titulo) uploadData.titulo = titulo;
			if (assunto && !livro.assunto) uploadData.assunto = assunto;
			if (pais && !livro.pais) uploadData.pais = pais;
			if (date && !livro.data_publicacao) uploadData.data_publicacao = date;

			await Livros.update(uploadData, {
				where: {
					id: livro.id,
					ISBN: livro.ISBN,
				}
			}).then(() => console.log(`ISBN: ${livro.ISBN} atualizado com sucesso!`));
		}else{
			await Livros.update({
				cbl_encontrado: false
			}, {
				where: {
					ISBN: livro.ISBN
				}
			}).then(() => console.log(`ISBN: ${livro.ISBN} não encontrado na API da CBL.`));
		}
	}

	const response = await Livros.count({
		where: {
			cbl_encontrado: false
		}
	});

	if(response) await openApi();

};

const openApi = async () => {

	const livrosDB = await Livros.findAll({
		where: {
			cbl_encontrado: false,
			outras_apis: null
		},
		raw: true
	});
	console.log(`Encontrado ${livrosDB.length} livros para pesquisar na OpenAPI.`);

	for await (const livro of livrosDB){

		const response = await axios({
			method: 'GET',
			url: 'http://openlibrary.org/api/books',
			params: {
				bibkeys: `ISBN:${livro.ISBN}`,
				jscmd: 'details',
				format: 'json',
			}
		}).then(res => res.data).catch(error => console.log(error.response));

		if(response[`ISBN:${livro.ISBN}`]){
            
			const dados = response[`ISBN:${livro.ISBN}`].details;

			let autor = string(dados?.publishers);
			let titulo = string(dados?.title);
			let date = dados?.publish_date;

			let uploadData = { outras_apis: true};

			if (autor && !livro.autor) uploadData.autor = autor;
			if (titulo && !livro.titulo) uploadData.titulo = titulo;
			if (date && !livro.data_publicacao) uploadData.data_publicacao = date;

			await Livros.update(uploadData, {
				where: {
					id: livro.id,
					ISBN: livro.ISBN,
				}
			}).then(() => console.log(`ISBN: ${livro.ISBN} atualizado com sucesso!`));
		}else{
			await Livros.update({
				outras_apis: false
			}, {
				where: {
					ISBN: livro.ISBN
				}
			}).then(() => console.log(`ISBN: ${livro.ISBN} não encontrado na API da openApi.`));
		}
	}

};

module.exports = isbnCblApi;