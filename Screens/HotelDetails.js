var o = require('FuseJS/Observable');
var _ = require('../lib/lodash');
var utils = require('../Modules/Utils.js');
const className = 'HotelRatings';
var hotel = o();
var curRating = o(5);
var myRatingLoaded = o(false);
var userRating = o({});
var ratingRequested = false;

var filters = { }// get rating of current user for current hotel

this.onParameterChanged(function(param) {
	hotel.value = param;
	var willCallRating = hotel.value != undefined && hotel.value.id != undefined;
	console.log( 'willCallRating = ' + willCallRating);
	if(willCallRating)
	{
		ratingRequested = false;
		getHotelRating(); // fetch initial rating
	}
});

// fetch user hotel rating
var Syncano = require("syncano-js-1.0.23/dist/syncano.fuse.js");
var apiKeys = require("../api-keys.js");
var connection = Syncano({
	accountKey:  apiKeys.accountKey,
	defaults: { 
		instanceName: apiKeys.instanceName, 
		className: className
	}
});

var userInfo = utils.getUserInfo();
var getHotelRating = function(){		
	/*if(ratingRequested){
		return;
	}
	ratingRequested = true;*/
	console.log( 'fetching hotel rating...')
	var query = {
		instanceName: apiKeys.instanceName,
		className: className
	};
	filters = {
		"HotelId": {"_eq": hotel.value.id}, 
		"UserId": {"_eq": userInfo.value.userProfile.owner}	
	}
	userRating.value = {
		"HotelId": hotel.value.id,
		"UserId": userInfo.value.userProfile.owner	
	}
	connection.DataObject.please().list(query).filter(filters).fields(['Rating','id']).orderBy('-created_at').pageSize(1)
	.then(function(objects){
		// check if objects is not null, for users who have not yet rated current entity	 	
		userRating.value["Rating"] = objects[0].Rating;
		userRating.value["id"] = objects[0].id;		
		console.log( 'fetched rating: ' + JSON.stringify( userRating))
		curRating.value = objects[0].Rating;
		myRatingLoaded.value = true;
	})
	.catch(function(err){
		// when Rating does not exist, error is thrown
		console.log('Rating not found for: ' +  JSON.stringify( filters));
		console.log( 'Error = ' + err)
		userRating.value["Rating"] = 5;
		curRating.value = 5;
		myRatingLoaded.value = true;
	});
}

var saveRating = function(){
// continue only if userId is already available
if(_.get(userInfo.value, 'userProfile.owner')){		
	// if userRating object has id, means already rated, hence updated...otherwise create a new object
	if(_.isNumber(userRating.value["id"])){ 
		if(curRating.value != userRating.value["Rating"]){
			console.log( 'updating existing rating...');
			// update existing rating
			userRating.value["Rating"] = curRating.value;
			var query = {
				id: userRating.value["id"],
				instanceName: apiKeys.instanceName,
				className: className
			};				
			connection.DataObject.please().update(query, {'Rating': curRating.value})
			.then(function(updatedObj){
				console.log('Rating updated : ' + JSON.stringify(updatedObj));
			})
			.catch(function(err){
				console.log('Update Rating failed :' + err);
			});
		}
	}
	else{
			// save new rating
			console.log( 'adding new rating')
			var newObj = {
				HotelId: hotel.value.id,
				UserId: userInfo.value.userProfile.owner,
				Rating: curRating.value
			};
			console.log(JSON.stringify( newObj));
			console.log( 'about to save a new entry to HotelRatings table');		
			connection.DataObject.please().create(newObj)
			.then(function(savedObject){
				console.log('New Rating saved: ' + JSON.stringify( savedObject));
				userRating.value = _.pick(savedObject, ["HotelId","UserId","id", "Rating"]);
			})
			.catch(function(err){
				console.log('New Rating update failed : ' + err);
			});
		}
	}
}

module.exports = {
	hotel: hotel,
	goBack: function(){
		router.goBack();
	},
	curRating: curRating,
	//ratingObject: ratingObject,
	upRating: function(){
		if(curRating.value < 10){
			curRating.value++;
		}
	},
	downRating: function(){
		if(curRating.value > 0){
			curRating.value--;
		}
	},
	updateRating: function(){
		console.log( 'save user rating to db');
		saveRating();
	},	
	myRatingLoaded: myRatingLoaded
}