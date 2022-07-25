const puppeteer = require('puppeteer');
const Livros = require('../model/Livros');
const Erros = require('../model/Erros');

const scrapper = async (page, editora) => {

    await page.goto(editora.url);

    let links = []
    let hasNext = 1

    do {
        await page.waitForSelector('.pagination .next')

        links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))))

        hasNext = (await page.$$(editora.next_page)).length
        if(hasNext) await page.click(editora.next_page)
        
    } while (hasNext)

    for await(const link of links){
        await page.goto(link)
        console.log(link)
        
        try {
            const isbnTitulo = await page.$eval('.subCat', el => el.innerText).catch(el => null)
            
            const isbn = isbnTitulo.match(editora.regex_isbn)
            const titulo = isbnTitulo.match(editora.regex_titulo)
            const autor = await page.$eval('.nome', el => el.innerText).catch(el => null)

            if(isbn){
            await Livros.upsert({
                ISBN: isbn.pop(),
                editora: editora.editora,
                autor,
                titulo: titulo ? titulo.pop() : null,
            }).catch(err => console.log(err))
            } else {
            await Erros.create({
                link
            })
            }
        } catch (error) {
            console.log(error)
        }
        
    }
}

module.exports = scrapper