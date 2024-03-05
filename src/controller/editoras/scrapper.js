import { launch } from 'puppeteer';

export class EditoraScrapper {
	constructor(config) {
		this.config = config;
	}

	async init() {
		const browser = await launch({ headless: false });
		this.page = await browser.newPage();

		if(this.config.intercept) await this.intercept();
		if(this.config.with_cookies) this.getCookies();
        if(this.config.type === 'api') this.
	}

	getCookies() {
		this.cookies = this.page.cookies();
	}

	async intercept(){
		await this.page.setRequestInterception(true);
		this.page.on('request', (request) => {
			if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
				request.abort();
			} else {
				request.continue();
			}
		});
	}
}
