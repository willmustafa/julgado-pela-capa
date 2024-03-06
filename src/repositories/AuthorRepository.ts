import Database from '../core/db/Database';

class AuthorRepository {
  async getAuthors() {
    const result = await Database.query('SELECT * FROM authors');
    return result.rows;
  }

  async addAuthor(name: string, email: string) {
    const result = await Database.query('INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING *', [
      name,
      email,
    ]);
    return result.rows[0];
  }
}

export default new AuthorRepository();
