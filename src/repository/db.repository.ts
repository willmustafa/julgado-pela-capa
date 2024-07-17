import { MongoClient, ServerApiVersion } from 'mongodb'

export const dbClient = new MongoClient(process.env.DB_HOST ?? '', {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export async function init() {
  await dbClient.connect()
}

export const database = dbClient.db('prd')

export const booksCollection = database.collection('books')
