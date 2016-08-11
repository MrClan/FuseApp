var o = require("FuseJS/Observable");
var db = require('FuseJS/Storage');
var Camera = require("FuseJS/Camera");
var CameraRoll = require("FuseJS/CameraRoll");
var ImageTools = require("FuseJS/ImageTools");
var Syncano = require("syncano-js-1.0.23/dist/syncano.fuse.js");

var exports = module.exports;

//  These observables will be used to display an image and its information

var imagePath = exports.imagePath = o();
var imageName = exports.imageName = o();
var imageSize = exports.imageSize = o();

//  This is used to keep the last image displayed as a base64 string in memory
var lastImage = "";
//  When we receive an image object we want to display, we call this
var displayImage = function(image)
{
	console.log('displaying img')
	imagePath.value = image.path;
	imageName.value = image.name;
	imageSize.value = image.width+"x"+image.height;	
	// data.img = b64;
	// db.write(jsonFile, JSON.stringify(data));
	ImageTools.getImageFromBase64(image).then(
		function(b64){
			console.log('enc---' + b64);
			lastImage = b64;
		}, function(error){
			console.log(error);
		});
}

var utils = require('../Modules/Utils.js');
var isReady = o(true);
var txtMsgs = o('');
exports.txtMsgs = txtMsgs;
exports.isReady = isReady; // denotes if any API request is already in progress

var data = {};
var tu = o('test@nt.com');
var tp = o('ab1234');
exports.tu=tu;
exports.tp=tp;


exports.gotoSignup =  function(){
	router.push('signup');
}

exports.getUserKey = function(){
	// fetch userkey and save it in local
	isReady.value = true;//false;
	txtMsgs.value = 'Logging you in...';
	utils.login(router, tu.value.trim(),tp.value.trim(), txtMsgs, isReady);
}

