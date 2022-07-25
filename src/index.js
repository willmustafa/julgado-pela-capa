require("dotenv").config();
const puppeteer = require('puppeteer');
const editoras = require('./configs/editoras');
const ProgressBar = require('progress');
require("./database/sync");

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  // await page.setRequestInterception(true);
  // page.on('request', (request) => {
  //   if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
  //       request.abort();
  //   } else {
  //       request.continue();
  //   }
  // });

  const MainBar = new ProgressBar(`Integrando a editora :current de :total`, {total: editoras.length})
  
  for await (const editora of editoras) {
    MainBar.tick()
    
    await require(`./controller/${editora.editora}.js`)(page, editora)
  }

  await browser.close();
})();
