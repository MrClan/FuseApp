var o = require('FuseJS/Observable');
var backend = require('./SyncanoWrapper.js');
var _ = require('../lib/lodash');
var exports = module.exports;

const className = 'hotels';
const fields = [
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
const orderBy = "-rating";
const pageSize = 1;
var hasPrev = o(false);
var hasNext = o(false);
var lastResultSet = {};
var loading = o(false);

exports.fields = fields;
exports.getHotelList = function(filters, successCb, errorCb, countUpdateCb){
	console.log( 'call wrapper to get list of hotels')
	var filters = filters || {};
	loading.value = true;
	backend.getListOf(className, filters, fields, orderBy, pageSize,
		function(results){
			hasPrev.value = results.hasPrev();
			hasNext.value = results.hasNext();
			lastResultSet = results;
			loading.value = false;
			successCb(results);			
		}, function(error){
			hasPrev.value = false;
			hasNext.value = false;
			loading.value = false;
			errorCb(error);
		});
	if(countUpdateCb){
		backend.getCount(className, filters, countUpdateCb);
	}
};

exports.hasNextPage = hasNext;
exports.hasPrevpage = hasPrev;

exports.gotoNext = function(successCb, errorCb){
	if(hasNext.value === true && lastResultSet){
		console.log( 'going to next...')		
		loading.value = true;
		lastResultSet.next()
		.then(function(results){
			lastResultSet = results;
			hasPrev.value = results.hasPrev();
			hasNext.value = results.hasNext();
			loading.value = false;
			console.log( 'hasPrev is ' + hasPrev.value)
			successCb(results);
		})				
		.catch(function(err){
			errorCb(err);					
			hasPrev.value = false;
			hasNext.value = false;
			loading.value = false;
		});
	}
};

exports.gotoPrev = function(successCb, errorCb){
	if(hasPrev.value === true && lastResultSet){
		console.log( 'going to previous...')
		loading.value = true;		
		lastResultSet.prev()
		.then(function(results){
			lastResultSet = results;
			hasPrev.value = results.hasPrev();
			hasNext.value = results.hasNext();
			loading.value = false;
			console.log( 'hasPrev is ' + hasPrev.value)
			successCb(results);
		})				
		.catch(function(err){
			errorCb(err);					
			hasPrev.value = false;
			hasNext.value = false;
			loading.value = false;
		});;
	}
};

exports.loading = loading;
var ratingFields = ['Rating','id'];
var ratingClassName = 'HotelRatings';
exports.getHotelRatingForUser = function(hotelId, userId, successCb, errorCb){
	loading.value = true;	
	var filters = {
		"HotelId": {"_eq": hotelId}, 
		"UserId": {"_eq": userId}	
	};
	backend.getListOf(ratingClassName, filters, ratingFields, "-created_at", 1,		
		function(results){
			console.log( 'fetching rating from module...');
			loading.value = false;
			console.log( JSON.stringify( results));
			if(_.isEmpty(results)){
				errorCb('No rating found');
			}else{
				successCb(_.pick(results[0], ratingFields));			
			}
		}, function(error){
			errorCb(error);
		});
};

exports.addOrUpdateRating = function(ratingObj, curRating, successCb, errorCb){
	// if userRating object has id, means already rated, hence updated...otherwise create a new object
	console.log( JSON.stringify( ratingObj), JSON.stringify( curRating));
	if(_.isNumber(ratingObj.id)){
		if(curRating != ratingObj.Rating){
			loading.value = true;
			console.log( 'updating existing rating...');
			backend.updateExisting(ratingClassName, ratingObj.id, {'Rating':curRating}, 
				function(updatedRatingObj){
					loading.value = false;
					successCb(updatedRatingObj);
				}, function(err){
					loading.value = false;
					errorCb(err);
				});
		}
	}
	else{		
		ratingObj.Rating = curRating;
		backend.saveNew(ratingClassName, ratingObj, 
			function(savedRatingObj){ 
				loading.value = false;
				successCb(savedRatingObj);
			}, function(err){
				loading.value = false;
				errorCb(err);
			});
	}
};
