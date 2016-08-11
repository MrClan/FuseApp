var o = require('FuseJS/Observable');
var _ = require('../lib/lodash');
var utils = require('../Modules/Utils.js');
var Syncano = require("syncano-js-1.0.23/dist/syncano.fuse.js");
var apiKeys = require("../api-keys.js");

var getListOf = function(className, filters, fields, orderBy, pageSize, successCallback, errorCallback){
	var connection = Syncano({accountKey: apiKeys.accountKey});
	var DataObject = connection.DataObject;	
	var query = {
		instanceName: apiKeys.instanceName,
		className: className
	};
	var filters = filters || {};
	DataObject.please()
	.list(query)
	.filter(filters)
	.fields(fields)
	.orderBy(orderBy)
	.pageSize(pageSize)
	.then(function(objects){
		successCallback(objects);
	})
	.catch(function(err){		
		errorCallback(err);
	});
}

var getCount = function(className, filters, successCallback, errorCallback){	
	var connection = Syncano({accountKey: apiKeys.accountKey});
	var DataObject = connection.DataObject;
	var query = {
		instanceName: apiKeys.instanceName,
		className: className
	};
	var filters = filters || {};
	DataObject.please()
	.list(query)
	.filter(filters)
	.count()
	.pageSize(0)
	.then(function(objects){
		successCallback(objects['objects_count']);
	})
	.catch(function(err){		
		errorCallback(err);
	});
}

var saveNew = function(className, objToSave,successCallback, errorCallback){	
	var connection = Syncano({
		accountKey: apiKeys.accountKey,
		defaults: {
			instanceName: apiKeys.instanceName,
			className: className
		}
	});
	var DataObject = connection.DataObject;
	DataObject.please().create(objToSave)
	.then(function(savedObj){
		console.log( 'SAVED OBJECT:::' + savedObj);
		successCallback(savedObj);
	})
	.catch(function(err){
		errorCallback(err);
	});
}

var updateExisting = function(className, id, objToUpdate,successCallback, errorCallback){	
	var connection = Syncano({
		accountKey: apiKeys.accountKey,
		defaults: {
			instanceName: apiKeys.instanceName,
			className: className
		}
	});
	var DataObject = connection.DataObject;
	var query = {
		id: id,
		instanceName: apiKeys.instanceName,
		className: className
	};
	DataObject.please().update(query, objToUpdate)
	.then(function(updatedObj){
		console.log( JSON.stringify( updatedObj), 'SUCCESS')
		successCallback(updatedObj);
	})
	.catch(function(err){
		console.log( 'ERROR' + err)
		errorCallback(err);
	});
}

module.exports = {
	getListOf: getListOf,
	getCount: getCount,
	saveNew: saveNew,
	updateExisting: updateExisting
}