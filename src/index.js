require('dotenv').config();
const puppeteer = require('puppeteer');
const editoras = require('./configs/editoras');
require('./database/sync');
const args = process.argv.slice(2);
const customFunctions = require('./database/customFunctions');

(async () => {
	await customFunctions();

	if(args.includes('--scrapper')){
		const browser = await puppeteer.launch({headless: false});
		const page = await browser.newPage();
  
		for await (const editora of editoras) { 
			await require(`./controller/editoras/${editora.editora}.js`)(page, editora);
		}
  
		await browser.close();
	}

	if(args.includes('--isbn')){
		await require('./controller/isbn/isbnApi')();
	}

	if(args.includes('--sql-format')){
		await require('./utils/formatSQL')();
	}

	process.exit();

})();
