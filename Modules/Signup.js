var o = require('FuseJS/Observable');
var keys = require('../api-keys.js');
var constants = require('../AppConstantsJS.js');
var utils = require('../Modules/Utils.js');
//var us = require('UserSettings');
var db = require('FuseJS/Storage');
var txtMsgs = o("");
var txtUser = o("");
var txtPswd = o("");
var txtConPswd = o("");

var register = function(){
	if(!validateEmail(txtUser.value))
	{
		txtMsgs.value = "Blank or Incorrect email";
		return;
	}
	if(!validatePassword(txtPswd.value))
	{
		txtMsgs.value = "Password must contain at least 6 characters and 1 Alphabet and 1 Number. Spaces are not allowed.";
		return;
	}
	if(txtPswd.value != txtConPswd.value)
	{
		txtMsgs.value = "Passwords do not match";
		return;
	}
	txtMsgs.value = '';
	var requestObject = {"username":txtUser.value,"password":txtPswd.value};
	var status = 0;
	var response_ok = false;	
	fetch(constants.signupUrl, 
	{
		method: 'POST',
		headers: { "Content-type": "application/json", "X-API-KEY": keys.adminApiKey},
		dataType: 'json',
		body: JSON.stringify(requestObject)
	}).then(function(response) {
				status = response.status;  // Get the HTTP status code
				response_ok = response.ok; // Is response.status in the 200-range?
				return response.json();    // This returns a promise
			}).then(function(responseObject) {
				if (status!=201) {
					if(JSON.stringify(responseObject).indexOf('must be unique') != -1)
						txtMsgs.value = 'Email already registered.';
				} else {
					txtMsgs.value = 'Logging you in...';
					saveUserDetailsOnDevice(requestObject);
				}
			}).catch(function(err) {
				txtMsgs.value = JSON.stringify(err);
			});
		}

		var validateEmail = function(email) {
			if(email.trim().length == 0)
				return false;
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};

		var validatePassword = function(pwd){
			var re= /^(?=.*[A-Za-z])(?=.*\d)\S{6,}$/;
			return re.test(pwd);
		}

		var saveUserDetailsOnDevice = function(requestObject){
	// fetch userkey and save it in local
	var status = 0;
	var response_ok = false;	
	fetch(constants.userAuthUrl, 
	{
		method: 'POST',
		headers: { "Content-type": "application/json", "X-API-KEY": keys.apiKey},
		dataType: 'json',
		body: JSON.stringify(requestObject)
	})
	.then(
		function(response) {
				status = response.status;  // Get the HTTP status code
				response_ok = response.ok; // Is response.status in the 200-range?
				return response.json();    // This returns a promise
			})
	.then(
		function(responseObject) {
			if (status!=200) {
				txtMsgs.value = 'Unable to login right now. Please try again in a moment. Details: ' + JSON.stringify(responseObject);
			} else {
			// save userAPIKey locally, and navigate to user profile
			var username = responseObject['username'];
			var userKey = responseObject['user_key'];
			// us.setString(constants.pref_Username, username);
			// us.setString(constants.pref_UserApiKey, userKey);
			var jsonFile = constants.dbFile;

			db.read(jsonFile).then(
				function(data){
					var jsonData = JSON.parse(data);
					console.log(data);
					jsonData['user'] = username;
					jsonData['userkey'] = userKey;// save new data
					// save this to the db json file
					db.write(jsonFile, JSON.stringify(jsonData)).then(
						function(){
							console.log('data save success');
							router.goto('profile');
						}, 
						function(){
							console.log('data write failed');
							txtMsgs.value = 'data write failed';
						});
				},
				function(err){
					console.log(err);
				});
		}
	})
	.catch(function(err) {
		txtMsgs.value = JSON.stringify(err);
	});
}

module.exports = {
	submitClicked: function(){
		register();
	},
	txtPswd : txtPswd,
	txtConPswd : txtConPswd,
	txtUser: txtUser,
	txtMsgs: txtMsgs,
	gotoLogin: function(){
		router.push('login');
	}
}