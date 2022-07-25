const puppeteer = require('puppeteer');
const Livros = require('../model/Livros');
const Erros = require('../model/Erros');

const scrapper = async (page, editora) => {

    let pagination = 1
    await page.goto(editora.url+pagination);

    const lastPage = await page.$eval('.page-numbers li:nth-last-child(2)>a', el => el.innerText)
    let links = []

    do {
        await page.waitForSelector('.page-numbers')

        links.push(...(await page.$$eval(editora.link_pagina, el => el.map(link => link.href))))
        pagination++

        await page.goto(editora.url+pagination)
    } while (String(pagination) != lastPage)

    for await(const link of links){
        await page.goto(link)
        console.log(link)
        
        try {
            const isbn = await page.$eval('.book-char>.book-char__item>.book-char__value', el => el.innerText).catch(el => null)
            const titulo = await page.$eval('.product_title', el => el.innerText).catch(el => null)
            const autor = await page.$eval('.book-author__title', el => el.innerText).catch(el => null)

            if(isbn){
            await Livros.upsert({
                ISBN: isbn.replaceAll('-', '').replaceAll(' ', ''),
                editora: editora.editora,
                autor,
                titulo,
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