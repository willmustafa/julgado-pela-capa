import axios from 'axios'
import { load } from 'cheerio'

export class Scraper {
  constructor() {}

  async loadPage(url: string) {
    return axios.get(url).then((response) => {
      const body = response.data
      return load(body)
    })
  }
}
