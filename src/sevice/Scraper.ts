import axios, { AxiosRequestConfig } from 'axios'
import { load } from 'cheerio'

export class Scraper {
  constructor() {}

  async loadPage(url: string) {
    return axios
      .get(url, { timeout: 1000 })
      .then((response) => {
        const body = response.data
        return load(body)
      })
      .catch((err) => {
        console.error('err')
        return Promise.reject(err)
      })
  }

  async loadFromAPI(url: string, options: AxiosRequestConfig = { timeout: 1000 }) {
    return axios
      .get(url, options)
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        console.error('err2')
        return Promise.reject(err)
      })
  }
}
