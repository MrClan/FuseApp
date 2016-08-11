var o = require('FuseJS/Observable');
var _ = require('../lib/lodash');
var utils = require('../Modules/Utils.js');
var title = o('HOTELS PAGE');
// fetch hotels from db
var Syncano = require("syncano-js-1.0.23/dist/syncano.fuse.js");
var apiKeys = require("../api-keys.js");
var connection = Syncano({accountKey: apiKeys.accountKey});
var DataObject = connection.DataObject;
var fields = [
"id",
"name",
"description",
"rating",
"minPrice",
"maxPrice",
"city",
"img",
"food",
"url",
"intro",
"imgUrl",
"reviews"
];
var pageSize = 24;
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
var isReady = o(true);
var hasPrev = o(false);
var hasNext = o(false);
var searchResultsSyncanoObject = {};

var getDataFromSyncano = function(filters, contentAlreadyInView){	
	var query = {
		instanceName: apiKeys.instanceName,
		className: "hotels"
	};
	var filters = filters || {};
	isReady.value = false;	
	DataObject.please()
	.list(query)
	.filter(filters)
	.fields(fields)
	.orderBy("-rating")
	.pageSize(pageSize)
	.then(function(objects){		
		updateView(objects, contentAlreadyInView);		
	})
	.catch(function(err){		
		resultsCount.value = err + '';
		hotelsList.clear();
		isReady.value = true;
	});
}

var getDataCountFromSyncano = function(filters){	
	console.log( 'fetching count...');
	var query = {
		instanceName: apiKeys.instanceName,
		className: "hotels"
	};
	var filters = filters || {};
	DataObject.please()
	.list(query)
	.filter(filters)
	.count()
	.pageSize(0)
	.then(function(objects){
		console.log( 'fetch count complete');
		resultsCount.value = objects["objects_count"] + ' matching hotels';
	})
	.catch(function(err){		
		console.log( 'fetch count complete with errors');
		console.log('error fetching count');
	});
}

getDataFromSyncano(null, true); // Fetch initial data
getDataCountFromSyncano(); // fetch initial data count

var updateView = function(searchResults, contentAlreadyInView){
	searchResultsSyncanoObject = searchResults;
	hasPrev.value = searchResults.hasPrev();
	hasNext.value = searchResults.hasNext();	
	hotelsList.clear();
	searchResults.forEach(function(item){
		hotelsList.add(_.pick(item,fields));
	});	
	isReady.value = true;
	if(!contentAlreadyInView){
		toggleView();
	}
}


var toggleView = function(){	
	spFiltersVisibility.value = spFiltersVisibility.value == 'Collapsed'? 'Visible':'Collapsed';
	spContentVisibility.value = spContentVisibility.value == 'Collapsed'? 'Visible':'Collapsed';
	btnText.value = btnText.value == 'Show Filters'? 'Hide Filters':'Show Filters';
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

	getDataFromSyncano(filter);
	getDataCountFromSyncano(filter);
}


module.exports = {
	gotoProfile: function(){
			router.push('profile');
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
	isReady: isReady,
	hasNext: hasNext,
	hasPrev: hasPrev,
	gotoNext: function(){
		if(hasNext.value === true){
			isReady.value = false;
			if(searchResultsSyncanoObject){
				searchResultsSyncanoObject.next()
				.then(function(objects){
					updateView(objects, true);
				})				
				.catch(function(err){
					resultsCount.value = err + '';
					hotelsList.clear();
					isReady.value = true;
				});
			}
		}
	},
	gotoPrev: function(){
		if(hasPrev.value === true){
			isReady.value = false;			
			if(searchResultsSyncanoObject){
				searchResultsSyncanoObject.prev()
				.then(function(objects){
					updateView(objects, true);
				})				
				.catch(function(err){
					resultsCount.value = err + '';
					hotelsList.clear();
					isReady.value = true;
				});;
			}
		}
	},
	gotoHotelDetails: function(args){			
			console.log('going to ' + args.data.id);
			router.push('hotelDetails', args.data);
		}
}