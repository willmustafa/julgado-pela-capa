const string = (string) => {
	let formatedString = string;
	if (!formatedString) formatedString = null;
	if (Array.isArray(formatedString)) formatedString = formatedString.toString();
	if(formatedString) formatedString = formatedString.toLowerCase();
	return formatedString;
};

const dateFormat = (date) => {
	let formatedDate = date;
	if(!formatedDate) formatedDate = null;
	if(formatedDate) formatedDate = new Date(formatedDate).toISOString();
	return formatedDate;
};

module.exports = {
	string,
	dateFormat,
};