const puppeteer = require('puppeteer');
const Livros = require('../model/Livros');
const Erros = require('../model/Erros');

const scrapper = async (page, editora) => {
  let filtros = Array.from(Array(26)).map((e, i) => i + 65).map((x) => String.fromCharCode(x))
  filtros = [...editora.filtros, ...filtros]

  for await (const filtro of filtros) {
    await page.goto(editora.url+filtro);
    console.log(`Acessando a página ${editora.url+filtro}`)

    let links = []
    let hasNext = true

    do {
      links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))))

      hasNext = await page.$(editora.next_page)
      if(hasNext) await page.click(editora.next_page)

      await page.waitForSelector(editora.link_pagina)

    } while (hasNext)

    let isbns = []


    for await(const link of links){
      await page.goto(link, {waitUntil: 'load'})

      await page.waitForSelector(editora.isbn)

      isbns.push(await page.$eval('.vendas-ficha-tecnica p', el => el.innerText))

      const isbn = await page.$eval('.vendas-ficha-tecnica p', el => el.innerText)
      const autor = await page.$eval('.autor_livro a', el => el.innerText.toLowerCase()).catch(el => null)
      const titulo = await page.$eval('.titulo_livro', el => el.innerText.toLowerCase()).catch(el => null)
      const assunto = await page.$eval('.desc_assunto', el => el.innerText.toLowerCase()).catch(el => null)
      
      if(isbn.replaceAll('-', '').match(/\d+/g)){
        await Livros.upsert({
          ISBN: isbn.replaceAll('-', '').match(/\d+/g).pop(),
          editora: editora.editora,
          autor,
          titulo,
          assunto
        }).catch(err => console.log(err))
      } else {
        await Erros.create({
          link
        })
      }
    }
  }
}

module.exports = scrapper