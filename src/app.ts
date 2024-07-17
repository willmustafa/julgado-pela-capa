import 'dotenv/config'
import { dbClient, init } from './repository/db.repository'
import { scrapGrupoPensamento } from './modules/grupopensamento'

;(async () => {
  await init()

  await scrapGrupoPensamento()
})()
