const puppeteer = require('puppeteer');
const Livros = require('../model/Livros');
const Erros = require('../model/Erros');

const range = ({from = 0, to, step = 1, length = Math.ceil((to - from) / step)}) => 
  Array.from({length}, (_, i) => from + i * step);

const scrapper = async (page, editora) => {
    const queryAnos = editora?.query_ano ? new Date().getFullYear() - editora.query_ano_min + 1 : 1
    const url = editora?.query_ano ? editora.url + editora.query_ano : editora.url

    for await (const year of range({from: editora.query_ano_min, length: queryAnos})) {
        
      await page.goto(url+year);
      console.log(`Acessando a página ${url+year}`)

      let fila = await page.$eval('#fila', el => el.value.split(','))
      let mostrando = await page.$eval('#mostrando', el => el.value.split(','))
      let isbns = [...fila, ...mostrando].filter(el => el != '')

      console.log('Salvando no banco de dados.')
      
      for await(const isbn of isbns){
          await Livros.upsert({
              ISBN: isbn,
              editora: editora.editora,
          }).catch(async err => await Erros.create({
            link
          }))
      }
    }
}

module.exports = scrapper