import { Scraper } from '../sevice/Scraper'
import { CheerioAPI } from 'cheerio'
import { booksCollection, dbClient } from '../repository/db.repository'

const URL = 'https://www.escala.com.br/livros?o=nome-produto&pg=1'
const BASE_URL = 'https://www.escala.com.br'

const selectors = {
  bookLinks: '#wd18 .wd-content li .name a',
  pagination: '.page-next',
  title: '.information .primeira .name',
  description: '.wd-descriptions-text',
  price: '.sale-price span',
  authors: '.wd-descriptions-text',
  specs: '.wd-descriptions-text table',
  about_the_author: '.wd-descriptions-text',
  images: '#scroll-media img'
}

export async function scrapEscala() {
  const scraper = new Scraper()
  let page = 1
  let isLastPage = false

  do {
    console.log(`Consultando página: ${URL.replace('pg=1', `pg=${page}`)}`)
    const $ = await scraper.loadPage(URL.replace('pg=1', `pg=${page}`))
    const lastListItem = $(selectors.pagination).last()
    isLastPage = !lastListItem

    const bookLinks = $(selectors.bookLinks).map((i, element) => {
      return $(element).attr('href')
    })

    await Promise.all(
      bookLinks.map(async (bookLink) => {
        try {
          const $bookPage = await scraper.loadPage(BASE_URL + bookLinks[bookLink])
          console.log(BASE_URL + bookLinks[bookLink])
          const script = $bookPage('#content-wrapper > script').first().html()
          const productFromScript = JSON.parse(
            script?.replace('var product = ', '')?.replace('};', '}') ?? '{}'
          )
          const book = {
            price: productFromScript.ListPrice,
            title: productFromScript.Name,
            publisher: productFromScript.BrandName,
            group: 'escala',
            images: [BASE_URL + productFromScript.MediaSmall],
            description: productFromScript.Descriptions.find(
              (el: any) => el.Alias === 'LongDescription'
            )?.Value,
            category: productFromScript.ExtendedMetadatas.find((el: any) => el.Alias === 'Genero')
              ?.Title,
            authors: productFromScript.ExtendedMetadatas.find((el: any) => el.Alias === 'Autor')
              ?.Title,
            about_the_author: productFromScript.Descriptions.find(
              (el: any) => el.Alias === 'Sinopse'
            )?.Value,
            dimensions: `${productFromScript.Items[0].Items[0].Width}x${productFromScript.Items[0].Items[0].Height}x${productFromScript.Items[0].Items[0].Depth}`,
            isbn: productFromScript.Descriptions.find(
              (el: any) => el.Alias === 'FichaTecnica'
            )?.Value.match(/ISBN<\/td>\s*<td class="tg-5y9l">&nbsp;\s*([0-9]+)/)?.[1],
            pages: productFromScript.Descriptions.find(
              (el: any) => el.Alias === 'FichaTecnica'
            )?.Value.match(/Número de Páginas<\/td>\s*<td class="tg-d3qz">&nbsp;\s*([0-9]+)/)?.[1],
            year: productFromScript.Descriptions.find(
              (el: any) => el.Alias === 'FichaTecnica'
            )?.Value.match(/Ano de Publicação<\/td>\s*<td class="tg-d3qz">&nbsp;\s*([0-9]+)/)?.[1],
            cover_type: productFromScript.Descriptions.find(
              (el: any) => el.Alias === 'FichaTecnica'
            )?.Value.match(/Formato<\/td>\s*<td class="tg-5y9l">&nbsp;\s*(.*?)<\/td>/)?.[1]
          }
          console.log(book)
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
        } catch (error) {}
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
