const puppeteer = require('puppeteer');
const Livros = require('../model/Livros');
const Erros = require('../model/Erros');

const scrapper = async (page, editora) => {

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    });

    let pagination = 1
    await page.goto(editora.url+pagination);

    await page.waitForSelector('.pager_last')

    const lastPage = Number.parseInt(await page.$eval('.pager_last', el => el.href.replaceAll('http://martinclaret.com.br/catalogo/page/', '').replaceAll('/', '')))
    let links = []

    do {
        await page.waitForSelector('#pagination')

        links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))))
        pagination++

        await page.goto(editora.url+pagination)
    } while (pagination != lastPage)

    try {
    for await(const link of links){
        await page.goto(link)
        console.log(link)
        

            const isbn = await page.$eval('.product', el => el.className).catch(el => null)
            const titulo = await page.$eval('.product_title', el => el.innerText).catch(el => null)
            const autor = await page.$eval('.product-author a', el => el.innerText).catch(el => null)

            try {
                if(isbn){
                    await Livros.upsert({
                        ISBN: isbn.match(editora.regex_isbn).pop().replaceAll('-', '').replaceAll(' ', ''),
                        editora: editora.editora,
                        autor: autor ? autor : null,
                        titulo,
                    }).catch(err => console.log(err))
                } else {
                    throw 'error'
                }
            } catch (error) {
                await Erros.create({
                    link
                })
                console.log(error)
            }

        
    }
} catch (error) {
    console.log(error)

}
}

module.exports = scrapper