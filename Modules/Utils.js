var o = require('FuseJS/Observable');
var db = require('FuseJS/Storage');
var Syncano = require("syncano-js-1.0.23/dist/syncano.fuse.js");
var apiKeys = require("../api-keys.js");
var appConstants = require('../AppConstantsJS.js');
var jsonFile = appConstants.userDbFile;
var connection = Syncano({accountKey: apiKeys.accountKey});
var DataObject = connection.DataObject;

var username = o('');
var userFirstName = o('');
var userLastName = o('');
var userEmail = o('');

// logsout user
var logout = function(router){
	console.log('clearing user data');	
	var jsonData = {}; // clear all user related data
	// save this to the db json file
	db.write(jsonFile, JSON.stringify(jsonData))
	.then(function(){
		username.value = '';
		userFirstName.value = '';
		userLastName.value = '';
		userEmail.value = '';
		console.log('Logout successful');
		router.goto('login');
	})
	.catch(function(err){
		console.log('Logout error: ' + err);
	});
}

var login = function(router, username, password, txtMsgs, isReady){
	txtMsgs.value = 'Logging you in...';
	isReady.value = false;
	// create a separate connection object since accountKey does not work for User endpoints
	var userConnection = Syncano({apiKey: apiKeys.apiKey});
	var user = userConnection.User;
	var status = 0;
	var response_ok = false;
	var requestObject = {
		'username': username,
		'password': password
	};

	if(requestObject.username.length < 4 || requestObject.password.length < 6){
		txtMsgs.value = 'Invalid username or password';
		isReady.value = true;
		return;
	}

	// try to login user
	user.please().login({instanceName: apiKeys.instanceName}, requestObject)
	.then(function(response){
		// try to get user profile details
		user.please().get({instanceName: apiKeys.instanceName})
		.then(function(userInfo){
			var jsonData = {};
			jsonData['username'] = requestObject['username'];
			jsonData['userkey'] = userConnection['userKey'];
			jsonData['userProfile'] = userInfo['profile'];			
			// save new data or overwrite all existing user data
			db.write(jsonFile, JSON.stringify(jsonData))
			.then(function(){
				console.log('data save success...going to profile page');							
				txtMsgs.value = 'Login successful';
				username.value = jsonData['username'];
				userFirstName.value = jsonData['userProfile']['FirstName'];
				userLastName.value = jsonData['userProfile']['LastName'];
				userEmail.value = jsonData['userProfile']['Email'];
				isReady.value = true;
				router.goto('profile');							
			})
			.catch(function(err){
				console.log( 'db file write error: ' + err);
				txtMsgs.value = err + ' Login failed.';
				isReady.value = true;
			});
			
		})
		.catch(function(err){
			console.log('Could not get user: ' + err);
			txtMsgs.value = 'Could not get user: ' + err;
			isReady.value = true;
		});
	})
	.catch(function(err){
		console.log('Login failed: ' + err['errors']['detail']);
		txtMsgs.value = 'Login failed: ' + err['errors']['detail'];
		isReady.value = true;
	});
}

var userInfo = o();
var getUserInfo = function(){
	// read the json file, and extract all userInfo from it
	db.read(jsonFile)
	.then(function(jsonData){
		userInfo.value = JSON.parse(jsonData);
	})
	.catch(function(err){
		console.log( err + '');
	});
}
	

var checkIfUserAlreadyLoggedIn = function(router, msg){
	db.read(jsonFile)
	.then(function(data){
		var jsonData = JSON.parse(data);
		if(jsonData['username'] != undefined && jsonData['username'].trim().length > 0)
		{
			console.log('User found. Taking you to profile page...');
			msg.value = 'continue as ' + jsonData['username'] + ' ? Or login as a new user ?'
			router.goto('profile');
		}
		else
		{
			msg.value = 'No user currently logged in. Taking you to the login page...';
			console.log('have to go to login page');
			router.goto('login');
		}
	})
	.catch(function(err){
		console.log(err);
		msg.value = 'No user currently logged in. Taking you to the login page...';
		console.log('Should go to login page');
		router.goto('login');
	});
}

// load cities
var cities = o('Any');
var query = {
	instanceName: apiKeys.instanceName,
	className: "city"
};

DataObject.please().list(query).then(function(objects) {
	objects.forEach(function(c){
		cities.add(c.Name);
	});
});

// load cuisines
var cuisines = o('Any');
var query = {
	instanceName: apiKeys.instanceName,
	className: "cuisine"
};

DataObject.please().list(query).then(function(objects) {
	objects.forEach(function(c){
		cuisines.add(c.Name);
	});
});

module.exports = {
	cities: cities,
	cuisines: cuisines,
	priceRanges: ['Any','0-1500','1500-5000','5000-25000','25000+'],
	logout: logout,
	login: login,
	checkIfUserAlreadyLoggedIn: checkIfUserAlreadyLoggedIn,
	getUserInfo: function(){
		getUserInfo();
		return userInfo;
	}
};