var o = require('FuseJS/Observable');
var _ = require('../lib/lodash');
var utils = require('../Modules/Utils.js');
var hm = require('../Modules/HotelModule.js');
var title = o('HOTELS PAGE');
var showFiltersUi = o(false);
var spFiltersVisibility = o('Collapsed');
var spContentVisibility = o('Visible');
var btnText = o('Show Filters');
var curHotelName= o('');
var curCity = o('Any');
var curPriceRange = o('Any');
var curCuisine = o('Any');
var hotelsList = o();
var resultsCount = o(hotelsList.length + ' hotels');

var displayError = function(error){	
	console.log( 'error callback')	;
	resultsCount.value = error + ''; 
	hotelsList.clear();
}

var updateView = function(searchResults){
	console.log( 'success callback');
	hotelsList.clear();
	searchResults.forEach(function(item){
		hotelsList.add(_.pick(item,hm.fields));
	});
	if(!contentAlreadyInView){
		toggleView(); 
	}
}

var updateCount = function(countInfo){
	console.log( 'count update callback')
	resultsCount.value = countInfo + ' matching hotels';
}

var toggleView = function(){	
	spFiltersVisibility.value = spFiltersVisibility.value == 'Collapsed'? 'Visible':'Collapsed';
	spContentVisibility.value = spContentVisibility.value == 'Collapsed'? 'Visible':'Collapsed';
	btnText.value = btnText.value == 'Show Filters'? 'Hide Filters':'Show Filters';
	contentAlreadyInView = !contentAlreadyInView;
}

var clearSearch = function(){
	curHotelName.value='';
	curCity.value='Any';
	curPriceRange.value ='Any';	
	curCuisine.value='Any';
}

var searchHotels = function(){
	var filter = {};

	// search only if hotelName is not blank
	if(curHotelName.value.trim().length > 0)
	{
		filter["name"] ={"_icontains":curHotelName.value.trim()};
	}

	// search only if city is not set to Any
	if(curCity.value != 'Any')
	{
		filter["city"] ={"_icontains":curCity.value};
	}

	// search only if priceRange is not set to Any
	if(curPriceRange.value != 'Any')
	{
		var maxPrice = 0;
		var minPrice = 0;
		if(curPriceRange.value.indexOf('+') != -1)
		{
			maxPrice = 1000000000;
			minPrice = parseFloat(curPriceRange.value.split('+')[0]);
		}
		else
		{
			minPrice = parseFloat(curPriceRange.value.split('-')[0]);
			maxPrice = parseFloat(curPriceRange.value.split('-')[1]);
		}
		filter["minPrice"] = {
			"_gte":minPrice,
			"_lte": maxPrice
		};
		/* COMMENTED UNTIL WE DO NOT FIGURE OUT HOW TO EXPRESS AN OR CONDITION ON MULTIPLE FIELDS
		filter["maxPrice"] = {
			"_gte":minPrice,
			"_lte": maxPrice
		};*/
	}

	// search only if cuisine is not set to Any
	if(curCuisine.value != 'Any')
	{
		filter["food"] ={"_icontains":curCuisine.value};
	}
	hm.getHotelList(filter, updateView, displayError, updateCount);
}


var contentAlreadyInView = true;
hm.getHotelList({}, updateView, displayError, updateCount);


module.exports = {
	gotoProfile: function(){
		router.push('profile');
	},	
	gotoHotelDetails: function(args){			
		console.log('going to ' + args.data.id);
		router.push('hotelDetails', args.data);
	},
	title: title,
	hotelsList: hotelsList,
	showFiltersUi: showFiltersUi,
	toggleView: toggleView,
	spContentVisibility: spContentVisibility,
	spFiltersVisibility: spFiltersVisibility,
	btnText: btnText,
	curHotelName: curHotelName,
	curCity: curCity,
	curPriceRange: curPriceRange,
	curCuisine: curCuisine,
	searchHotels: searchHotels,
	clearSearch: clearSearch,
	utils: utils,
	resultsCount: resultsCount,
	isLoading: hm.loading,
	hasNext: hm.hasNextPage,
	hasPrev: hm.hasPrevPage,
	gotoNext: function(){
		hm.gotoNext(updateView, displayError);
	},
	gotoPrev: function(){
		hm.gotoPrev(updateView, displayError);
	}
}