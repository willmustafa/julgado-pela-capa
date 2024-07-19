import { Scraper } from '../sevice/Scraper'
import { CheerioAPI } from 'cheerio'
import { booksCollection } from '../repository/db.repository'

const URL = 'https://yx8e79nchh.execute-api.us-east-1.amazonaws.com/prod/catalogo/facets'
const BASE_URL = 'https://www.moderna.com.br'

const selectors = {
  bookLinks: '.CCResultListaItem .CCResultItem a',
  title: '.cabecalho h2',
  description: '#sobreOLivro .CCorpo p',
  authors: '.sobreAutores-descricao h3',
  specs: '.wrapConhecaMais .listaFlex li',
  about_the_author: '.sobreAutores-descricao p',
  images: '.CCThumbnails .thumbnails img',
  navigation: '.Paginacao li'
}

export async function scrapModerna() {
  const scraper = new Scraper()
  let page = 1
  let isLastPage = false

  do {
    console.log(`Consultando página: ${page}`, URL)
    const response = await scraper.loadFromAPI(URL, {
      params: {
        quantidadePorPagina: 2000,
        tipo: 1,
        pagina: page
      }
    })
    isLastPage = response.data.paginacao.pagina_final === page

    for (const responseElement of response.data.livros) {
      let book: any = {
        title: responseElement.titulo,
        publisher: responseElement.selo.nome,
        isbn: responseElement.isbn,
        authors: responseElement.autores.map((el: any) => el.nome),
        group: 'moderna'
      }

      try {
        console.log(
          'entrando na pagina',
          BASE_URL + '/literatura/livro/' + responseElement.slugAmigavel
        )
        const $bookPage = await scraper.loadPage(
          BASE_URL + '/literatura/livro/' + responseElement.slugAmigavel
        )

        book = {
          ...book,
          description: $bookPage(selectors.description).html(),
          about_the_author: $bookPage(selectors.about_the_author).text(),
          images: getImages($bookPage),
          category: getFromSpec($bookPage, 'Assunto'),
          dimensions: getFromSpec($bookPage, 'Dimensões do produto'),
          pages: parseInt(getFromSpec($bookPage, 'Número de páginas')),
          year: parseInt(
            getFromSpec($bookPage, 'Ano de publicação:') ||
              getFromSpec($bookPage, 'Ano da última edição do livro')
          ),
          cover_type: getFromSpec($bookPage, 'Formato')
        }

        await booksCollection.updateOne(
          {
            title: book.title,
            authors: book.authors,
            group: book.group,
            publisher: book.publisher,
            isbn: book.isbn
          },
          { $set: book },
          { upsert: true }
        )
      } catch (e) {
        console.log(e)
      }
    }

    page++
  } while (!isLastPage)
}

function getFromSpec($bookPage: CheerioAPI, startText: string) {
  const $descriptions = $bookPage(selectors.specs)
  let result = ''
  if ($descriptions.length)
    $descriptions.each((i, element) => {
      const text = $bookPage(element).text().trim()
      if (text.startsWith(startText)) {
        result = text.replace(startText, '').trim()
      }
    })
  return result
}

function getAuthor($bookPage: CheerioAPI) {
  const $descriptions = $bookPage(selectors.authors)
  const result: string[] = []
  if ($descriptions.length)
    $descriptions.each((i, element) => {
      const text = $bookPage(element).text().trim()
      if (text.startsWith('Autor(es):')) {
        const authors = text.replace('Autor(es):', '').trim().split(' e ')

        authors.forEach((author) =>
          result.push(`${author.split(',')[1]} ${author.split(',')[0]}`.trim())
        )
      }
    })
  return result
}

function getImages($bookPage: CheerioAPI) {
  const $images = $bookPage(selectors.images)
  const result: string[] = []
  if ($images.length)
    $images.each((i, element) => {
      const href = $bookPage(element).attr('src')
      result.push(`${BASE_URL}${href?.replace('false', 'true')}`)
    })
  return result
}
