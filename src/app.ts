import 'dotenv/config'
import { init } from './repository/db.repository'
import { scrapGrupoPensamento } from './modules/grupopensamento'
import { scrapModerna } from './modules/moderna'
import { scrapEscala } from './modules/escala'

;(async () => {
  await init()

  /*await scrapGrupoPensamento()
  await scrapModerna()*/
  await scrapEscala()
})()
