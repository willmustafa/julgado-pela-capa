const puppeteer = require('puppeteer');
const Livros = require('../model/Livros');
const Erros = require('../model/Erros');

const scrapper = async (page, editora) => {

    let pagination = 16
    await page.goto(editora.url+pagination);

    await page.waitForSelector('.Paginacao')

    const lastPage = (await page.$$eval('.Paginacao li>button:not(.arrowButton)', el => el.map(text => text.innerText))).length
    let links = []

    do {
        await page.waitForSelector('.Paginacao')

        links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))))
        pagination++

        await page.goto(editora.url+pagination)
    } while (pagination != lastPage)

    try {
    for await(const link of links){
        await page.goto(link)
        console.log(link)
        

            const isbn = await page.$eval('.detalhes>ul', el => el.innerText).catch(el => null)
            const titulo = await page.$eval('.cabecalho>h2', el => el.innerText).catch(el => null)
            const autor = await page.$eval('.content>p', el => el.innerText).catch(el => null)

            if(isbn){
            await Livros.upsert({
                ISBN: isbn.match(/(?<=ISBN )(.*)/im).pop().replaceAll('-', '').replaceAll(' ', ''),
                editora: editora.editora,
                autor: autor ? autor.replaceAll('Autor:', '').replaceAll('Autora:', '').replaceAll('Autores:', '') : null,
                titulo,
            }).catch(err => console.log(err))
            } else {
            await Erros.create({
                link
            })
            }

        
    }
} catch (error) {
    console.log(error)

}
}

module.exports = scrapper