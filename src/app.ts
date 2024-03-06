import 'dotenv/config'
import Scraper from './service/Scrapper';
import { publishers } from './core/entities/PublisherConfig';

(async () => {
    const scrapper = new Scraper()
    await scrapper.initialize()

    for (const publisher of publishers) {
        await scrapper.scrape(publisher)
    }
})();
