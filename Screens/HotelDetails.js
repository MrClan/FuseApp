var o = require('FuseJS/Observable');
var utils = require('../Modules/Utils.js');
var hm = require('../Modules/HotelModule.js');
const className = 'HotelRatings';
var hotel = o();
var curRating = o(5);
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
		var uid = userInfo.value.userProfile.owner;
		userRating.value = {
			"HotelId": hotel.value.id,
			"UserId": uid
		}
		hm.getHotelRatingForUser(hotel.value.id, uid, updateRating, displayError); // fetch initial rating
	}
});

var userInfo = utils.getUserInfo();

var updateRating = function(ratingObj){
	userRating.value["Rating"] = ratingObj.Rating;
	userRating.value["id"] = ratingObj.id;
	console.log( 'fetched rating: ' + JSON.stringify( ratingObj));
	curRating.value = ratingObj.Rating;
	console.log( 'currentRating = ' + curRating.value);
}

var displayError = function(err){
	// when Rating does not exist, error is thrown
	console.log( 'Error = ' + err)
	userRating.value["Rating"] = 5;
	curRating.value = 5;
}

var onRatingSaveSuccess = function(newRatingObj){
	console.log('Rating updated complete: ' + JSON.stringify(newRatingObj));
	curRating.value = newRatingObj.Rating;
	userRating.value.Rating = newRatingObj.Rating;
	userRating.value.id = newRatingObj.id;
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
		hm.addOrUpdateRating(userRating.value, curRating.value, onRatingSaveSuccess, onRatingSaveSuccess);
	},	
	myRatingLoaded: hm.loading
}