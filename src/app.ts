import 'dotenv/config'
import { init } from './repository/db.repository'
import { scrapGrupoPensamento } from './modules/grupopensamento'
import { scrapModerna } from './modules/moderna'
;(async () => {
  await init()

  await scrapGrupoPensamento()
  await scrapModerna()
})()
