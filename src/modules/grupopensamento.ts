import { Scraper } from '../sevice/Scraper'
import { CheerioAPI } from 'cheerio'
import { booksCollection, dbClient } from '../repository/db.repository'

const URL =
  'https://www.grupopensamento.com.br/vitrine/catalogo-completo/page=1/departamento=todos/ordenacao=data_lancamento/direction=DESC'
const BASE_URL = 'https://www.grupopensamento.com.br'

const selectors = {
  bookLinks: '.listItems__link',
  title: '.ttDefault',
  description: '.desc',
  price: '.p-fisico big',
  authors: '.ficha-tecnica.pensamento-product-avaliable li',
  specs: '.ficha-tecnica.pensamento-product-avaliable li',
  about_the_author: '.sobre-autor .description',
  images: '#carousel .car-miniature img'
}

export async function scrapGrupoPensamento() {
  const scraper = new Scraper()
  let page = 1
  let isLastPage = false

  do {
    console.log(`Consultando página: ${page}`)
    const $ = await scraper.loadPage(URL.replace('page=1', `page=${page}`))
    const lastListItem = $('ol.navigation li').last()
    isLastPage = lastListItem.hasClass('current')

    const bookLinks = $(selectors.bookLinks).map((i, element) => {
      return $(element).attr('href')
    })

    await Promise.all(
      bookLinks.map(async (bookLink) => {
        try {
          const $bookPage = await scraper.loadPage(BASE_URL + bookLinks[bookLink])
          const book = {
            title: $bookPage(selectors.title).text(),
            description: $bookPage(selectors.description).html(),
            price: parseFloat(
              $bookPage(selectors.price).text().replace('Por: R$ ', '').replace(',', '.')
            ),
            authors: getAuthor($bookPage),
            about_the_author: $bookPage(selectors.about_the_author).text(),
            images: getImages($bookPage),
            category: getFromSpec($bookPage, 'Categoria:'),
            dimensions: getFromSpec($bookPage, 'Dimensões:'),
            group: 'pensamento',
            publisher: getFromSpec($bookPage, 'Editora:'),
            isbn: getFromSpec($bookPage, 'ISBN:'),
            pages: parseInt(getFromSpec($bookPage, 'Número de páginas:')),
            year: parseInt(getFromSpec($bookPage, 'Ano de publicação:')),
            cover_type: getFromSpec($bookPage, 'Encadernação:')
          }
          await booksCollection.updateOne(
            {
              title: book.title,
              price: book.price,
              authors: book.authors,
              group: book.group,
              publisher: book.publisher,
              isbn: book.isbn
            },
            { $set: book },
            { upsert: true }
          )
        } catch (error) {
          console.error(error)
        }
      })
    )

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
