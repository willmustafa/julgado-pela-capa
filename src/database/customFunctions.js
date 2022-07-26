const database = require('./index');

const autor_list = `CREATE MATERIALIZED VIEW public.lista_autores
AS
SELECT autor, COUNT(*) FROM "Livros" 
WHERE autor IS NOT NULL 
GROUP BY autor 
ORDER BY autor ASC
WITH DATA;
`;

const execute = async () => {

	await database.query(autor_list).then(res => console.log(res)).catch(() => {});
};

module.exports = execute;