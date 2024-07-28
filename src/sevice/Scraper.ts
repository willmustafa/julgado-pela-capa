import axios, { AxiosRequestConfig } from 'axios'
import { load } from 'cheerio'
import { USER_AGENTS } from '../helpers/userAgents'

export class Scraper {
  constructor() {}

  async loadPage(url: string, options: AxiosRequestConfig = { timeout: 1000 }) {
    return axios
      .get(url, {
        timeout: 6000,
        headers: {
          'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
        }
      })
      .then((response) => {
        const body = response.data
        return load(body)
      })
      .catch((err) => {
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
        return Promise.reject(err)
      })
  }
}
