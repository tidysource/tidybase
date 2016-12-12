'use strict';

/*
Imports
=======
*/
//Official Firebase SDK
if (typeof require !== 'undefined'){//Enables use outside Node
	var firebase = require('firebase');
}

/*
Helper functions
================
*/
var defined = function defined(param){
	if (typeof param === 'undefined'){
		return false;
	}
	else{
		return true;
	}
}

var parsePath = function parsePath(grossPath){
	//dbURL up to second / (first one is part of protocol)
	var dbURL = /^[^/]+\/+[^/]+/.exec(grossPath)[0]; //
	return {
			dbURL : dbURL,
			netPath : grossPath.slice(dbURL.length)
			};
};

var ref = function ref(dbPath){	
	if (dbPath.at){
		dbPath = dbPath.at; 	
	}
	
	var parsedPaths = parsePath(dbPath);
	var netPath = parsedPaths.netPath;
	var dbURL = parsedPaths.dbURL;

	var query = app(dbURL).database().ref(netPath);
		
	if (dbPath.at){
		if (defined(param.limitToFirst)){ 
			query = query.limitToFirst(param.limitToFirst); 
		}
		else if (defined(param.limitToLast)){ 
			query = query.limitToLast(param.limitToLast); 
		}

		if (defined(param.equalTo)){ 
			query = query.equalTo(param.equalTo);
		}
		else{
			if (defined(param.startAt)){ 
				query = query.startAt(param.startAt);
			}
			if (defined(param.endAt)){ 
				query = query.endAt(param.endAt);
			}	
		}
	}
	
	return query;
};

/*
Init
====
*/
//----- Helper functions -----
/*
Initialise app and return app object
@param - config [object]
*/
var initApp = function initApp(config){
	var dbURL = config.databaseURL

	if (!app.list[dbURL]){
		var ref = firebase.initializeApp(config, dbURL);
		//NOTE: There is no 'default' app
		app.list[dbURL] = {
							ref: ref, 
							events: {}
							};
	}
	
	return app.list[dbURL];
};

var appEvent = function appEvent(e, eVal){
	if (e && eVal){
		app.list[dbURL].events[e] = eVal;
	}
	else if (e){
		app.list[dbURL].events[e]();
	}
	else{
		throw new Error('Event is a requered parameter.');
	}
};

/*
Return app object of initialised app
@param - dbURL [string]
*/
var getApp = function getApp(dbURL){
	var ref = app.list[dbURL];
	if (!ref){
		var err = ['App "',dbURL,'" ',
					'not initialised. ',
					'Call app(cofnig).'
					].join('');
		throw new Error(err);
	}
	else{
		return ref;
	}
};

//----- App -----
/*
Return database reference object
@param - dbURL [string] or config [object]
*/
var app = function app(param){
	if (typeof param === 'string'){
		//dbURL === param
		return getApp(param).ref;
	}
	else{			
		//param === config
		return initApp(param).ref;
	}
};

//-----All app objects-----
app.list = {};

/*
Users
=====
*/
app.addUser = function addUser(dbURL, user){
	return app(dbURL).auth().createUserWithEmailAndPassword(user.email, user.password);
};

//For internal use (not to handle login/logout)
app.getUser = function getUser(dbURL){
	return app(dbURL).auth().currentUser;
};
	
app.updateUser = function updateUser(dbURL, profile){
	var user = app.getUser(dbURL);
	return user.updateProfile(profile);
};

app.updateUserEmail = function updateUserEmail(dbURL, email){
	var user = app.getUser(dbURL);
	return user.updateEmail(email);
};

app.updateUserPassword = function updateUserPassword(dbURL, password){
	var user = app.getUser(dbURL);
	return user.updatePassword(password);
};

app.userEmailVerification = function userEmailVerification(dbURL){
	var user = app.getUser(dbURL);
	return user.sendEmailVerification();
};

app.userEmailResetPassword = function userEmailResetPassword(dbURL, email){
	return app(dbURL).auth().sendPasswordResetEmail(email);
};

app.removeUser = function removeUser(dbURL){
	var user = app.getUser(dbURL);
	return user.delete();
};

app.loginUser = function loginUser(dbURL, user){
	return app(dbURL).auth().signInWithEmailAndPassword(user.email, user.password);
};

app.logoutUser = function logoutUser(dbURL){
	return app(dbURL).auth().signOut();
};

app.reauthUser = function reauthUser(dbURL, credentials){
	var user = app.getUser(dbURL);
	return user.reauthenticate(credentials);
};

/*
Read & Write
============
*/
app.set = function set(dbPath, val){
	return ref(dbPath).set(val);
};

app.push = function push(dbPath, val){
	return ref(dbPath).push(val);
};

//Return a UUID
app.uuid = function(dbPath){
	return ref(dbPath).push().key;
};

//Updates are transactional (either all succedd or all fail)
app.update = function update(dbPath, val){
	return ref(dbPath).update(val);
};

//To get val use snapshot.val() in callback
app.get = function get(dbPath){
	return ref(dbPath).once('value');
};

app.remove = function remove(dbPath){
	return ref(dbPath).remove();
};

app.transaction = function transaction(dbPath, updates){
	return ref(dbPath).transaction(updates);
};

/*
Events
======
*/
//TO-DO: default fail callback should throw error
//Note: callback is requiered, fail callback is not
app.on = function get(dbPath, e, callback, fail){
	if (e === 'loginLogout'){
		var dbURL = parsePath(dbPath).dbURL;
		var authOff = app(dbURL)
						.auth()
						.onAuthStateChanged(
							//On current user value change
							function (user){
								if (callback){
									callback(user);
								}
							},
							//Auth fail
							function(error){
								if (fail){
									fail(error);
								}
							});
		appEvent('authOff',authOff);
	}
	else{
		//Events name confrom to camelCase
		e = e.replace(/[A-Z]/g, function(str){
			return '_' + str.toLowerCase();
		});
		/*
		NOTE:
		Return is so you can call off the event with an
		inline callback function (onCallback in app.off)
		*/
		return ref(dbPath)
				.on(e,
					//On event
					function(snapshot){
						if (callback){ 
							callback(snapshot);
						}
					},
					//Subscription fail
					function(error){
						if (fail){
							fail(error);
						}	
					})	
	}
};

app.off = function off(dbPath, e, onCallback){
	if (e === 'loginLogout'){
		appEvent('authOff');
	}
	else{
		if (onCallback){
			ref(dbPath).off(e, onCallback);
		}
		else{
			ref(dbPath).off(e);	
		}	
	}
};
//<--- handle disconnect event https://firebase.google.com/docs/database/web/offline-capabilities
//<--- Errors are being swollowed in .then (need something like done or return the promises)
/*
Exports
=======
*/
module.exports = app;