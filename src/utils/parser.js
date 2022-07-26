const parserISBN = (value) => {
	return String(value)
		.replaceAll('-', '')
		.replaceAll(' ', '')
		.replaceAll('.', '')
		.replaceAll(',', '')
		.trim()
		.toUpperCase();
};

const parserStringRegex = (value, regex) => {
	if (!value) return null;
    
	let formatedString = '';
	const match = String(value).match(regex);

	if (!match) return null;

	formatedString = String(match.pop().toString());
    
	return formatedString
		.trim()
		.toLowerCase();
};

const parserAutor = (value) => {
	if(!value) return null;
	
	return String(value)
		.toLowerCase()
		.replaceAll('autor:', '')
		.replaceAll('autora:', '')
		.replaceAll('autores:', '')
		.replaceAll('autor(es):', '')
		.replaceAll('(mais do autor)', '')
		.replaceAll('(mais da autora)', '')
		.replaceAll('(mais dos autores)', '')
		.replaceAll('(mais do(s) autor(es))', '')
		.trim();
};

module.exports = {
	parserISBN,
	parserStringRegex,
	parserAutor,
};