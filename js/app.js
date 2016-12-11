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

var handleCallback = function handleCallback(param, callback){
	if (arguments.length === 2){
		callback(param);
	}
	if (arguments.length === 1){
		//callback = param;
		param();
	}
};

var handleError = function handleError(error, fail){
	if (typeof fail === 'function'){
		fail(error);
	}
	else{
		throw new Error(error);
	}
};

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
app.addUser = function addUser(dbURL, user, callback, fail){
	app(dbURL)
		.auth()
		.createUserWithEmailAndPassword(user.email, user.password)
		.then(
			function(){ handleCallback(callback); },
			function(error){ handleError(error, fail); }
			);
};

//For internal use (not to handle login/logout)//<--- do not make promise, instead just make chainable
app.getUser = function getUser(dbURL, callback){
	var user = app(dbURL).auth().currentUser;
	callback(user);
};
	
app.updateUser = function updateUser(dbURL, profile, callback, fail){
	app.getUser(dbURL, function(user){
		user.updateProfile(profile)
			.then(
				function(){ handleCallback(callback); },
				function(error){ handleError(error, fail); }
				);
	});
};

app.updateUserEmail = function updateUserEmail(dbURL, email, callback, fail){
	app.getUser(dbURL, function(user){
		user.updateEmail(email)
			.then(
				function(){ handleCallback(callback); },
				function(error){ handleError(error, fail); }
				);
	});
};

app.updateUserPassword = function updateUserPassword(dbURL, password, callback, fail){
	app.getUser(dbURL, function(user){
		user.updatePassword(password)
			.then(
				function(){ handleCallback(callback); },
				function(error){ handleError(error, fail); }
				);
	});
};

app.userEmailVerification = function userEmailVerification(dbURL, callback, fail){
	app.getUser(dbURL, function(user){
		user.sendEmailVerification()
			.then(
				function(){ handleCallback(callback); },
				function(error){ handleError(error, fail); }
				);
	});
};

app.userEmailResetPassword = function userEmailResetPassword(dbURL, email, callback, fail){
	app.getUser(dbURL, function(user){
		app(dbURL)
			.auth()
			.sendPasswordResetEmail(email)
			.then(
				function(){ handleCallback(callback); },
				function(error){ handleError(error, fail); }
				);
	});
};

app.removeUser = function removeUser(dbURL, callback, fail){
	app.getUser(dbURL, function (user){
		user.delete()
			.then(
				function(){ handleCallback(callback); },
				function(error){ handleError(error, fail); }
				);
	});
};

app.loginUser = function loginUser(dbURL, user, callback, fail){
	app(dbURL)
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then(
			function(){ handleCallback(callback); },
			function(error){ handleError(error, fail); }
			);
};

app.logoutUser = function logoutUser(dbURL, callback, fail){
	app(dbURL)
		.auth()
		.signOut()
		.then(
			function(){ handleCallback(callback); },
			function(error){ handleError(error, fail); }
			);
};

app.reauthUser = function reauthUser(dbURL, credentials, callback, fail){
	app.getUser(dbURL, function(user){
		user.reauthenticate(credentials)
			.then(
				function(){ handleCallback(callback); },
				function(error){ handleError(error, fail); }
				);
	});
};

/*
Read & Write
============
*/
app.set = function set(dbPath, val, callback, fail){
	ref(dbPath)
		.set(val)
		.then(
			function(){ handleCallback(callback); },
			function(error){ handleError(error, fail); }
			);
};

app.push = function push(dbPath, val, callback, fail){
	ref(dbPath)
		.push(val)
		.then(
			function(){ handleCallback(callback); },
			function(error){ handleError(error, fail); }
			);
};

//Return a UUID
app.uuid = function(dbPath){
	return ref(dbPath).push().key;
};

//Updates are transactional (either all succedd or all fail)
app.update = function update(dbPath, val, callback, fail){
	ref(dbPath)
		.update(val)
		.then(
			function(val){ handleCallback(val, callback); },
			function(error){ handleError(error, fail); }
			);
};

//To get val use snapshot.val() in callback
app.get = function get(dbPath, callback, fail){
	ref(dbPath)
		.once('value')
		.then(
			function(snapshot){ handleCallback(snapshot, callback); },
			function(error){ handleError(error, fail); }
			);
};

app.remove = function remove(dbPath, callback, fail){
	ref(dbPath)
		.remove()
		.then(
			function(){ handleCallback(callback); },
			function(error){ handleError(error, fail); }
			);
};

app.transaction = function transaction(dbPath, updates, callback, fail){
	ref(dbPath)
		.transaction(updates)
		.then(
			function(){ handleCallback(callback); },
			function(error){ handleError(error, fail); }
			);
};

/*
Events
======
*/
//TO-DO based on Note: callback is requiered, fail callback is not, default --> throw 
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
	};
	else{
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