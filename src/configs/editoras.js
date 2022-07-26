const editoras = [
	{
		editora: 'companhia-das-letras',
		url: 'https://www.companhiadasletras.com.br/Busca?ordem=cronologica',
		book_url: 'https://www.companhiadasletras.com.br/livro/',
		query_ano: '&ano=',
		query_ano_min: 1985,
	},
	// {
	// 	editora: 'rocco',
	// 	url: 'https://www.rocco.com.br/catalogo/catalogo-completo/?filtro=',
	// 	filtros: [1, 3, 9],
	// 	link_pagina: '.bloco-livro a',
	// 	next_page: '.next.page-numbers',
	// 	isbn: '.vendas-ficha-tecnica>p'
	// },
	// {
	// 	editora: 'arqueiro',
	// 	url: 'https://www.editoraarqueiro.com.br/livros',
	// 	link_pagina: '.listaLivro.clearfix .maisDetalhes',
	// 	next_page: '.pagination .next:not(.disabled)',
	// 	regex_isbn: /(?<=ISBN: )(.*)/m,
	// 	regex_titulo: /(?<=Título original: )(.*)/im,
	// 	autor: '.nome'
	// },
	// {
	// 	editora: 'record',
	// 	url: 'https://www.record.com.br/categoria-produto/livros/page/',
	// 	next_page: '.next.page-numbers',
	// 	link_pagina: 'li.product .product_thumbnail>a'
	// },
	// {
	// 	editora: 'moderna',
	// 	url: 'https://www.moderna.com.br/literatura/catalogo?pagina=',
	// 	link_pagina: '.CCResultItem a',
	// 	regex_isbn: /(?<=ISBN: )(.*)/m,
	// },
	// {
	// 	editora: 'martin-claret',
	// 	url: 'http://martinclaret.com.br/catalogo/page/',
	// 	link_pagina: '.product>a',
	// 	regex_isbn: /(?<=pa_isbn-)(.*)(?= pa_paginas)/s
	// },
	// {
	// 	editora: 'alta-books',
	// 	url: 'https://altabooks.com.br/livros/?product-page=',
	// 	link_pagina: '.woocommerce-LoopProduct-link.woocommerce-loop-product__link',
	// 	regex_autor: /(?<=Autor: )(.*)/m
	// }
];

module.exports = editoras;
