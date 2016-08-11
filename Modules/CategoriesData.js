var Observable = require('FuseJS/Observable');
var data = Observable();
var fetched = false;
if(!fetched)
{
	var categoriesUrl = 'https://ntf1.firebaseio.com/v1/MainCategories.json';
	fetch(categoriesUrl)
	.then(function(response){ return response.json(); })
	.then(function(responseObject) {
		for(i in responseObject)
		{
			data.add(responseObject[i]);
		}
		fetched = true;
	});
}

module.exports = {
	items: data
};
