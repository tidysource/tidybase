'use strict';

/*
Imports
=======
*/
	//Official Firebase SDK
	var firebase = require("firebase");

/*
Helper functions
================
*/
var handleCallback = function handleCallback(param, callback){
	if (arguments.length === 2){
		callback(param);
	}
	if (arguments.length === 1){
		//callback = param;
		param();
	}
}

var handleError = function handleError(error, fail){
	if (typeof fail === 'function'){
		fail(error);
	}
	else{
		throw new Error(error);
	}
}

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
				//NOTE: There is no "default" app
				app.list[dbURL] = {ref: ref};
			}
			
			return app.list[dbURL];
		};
		
		/*
		Return app object of initialised app
		@param - dbURL [string]
		*/
		var getApp = function getApp(dbURL){
			var ref = app.list[dbURL];
			if (!ref){
				var err = ["App '",
							dbURL,
							"' not initialised."
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
			if (typeof param === "string"){
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
	
	//For internal use (not to handle login/logout)
	app.getUser = function getUser(dbURL, callback){
		var user = app(dbURL).auth().currentUser;
		if (user){
			handleCallback(user, callback);
		}
		else{
			handleError("No user", fail);
		}
	};
	
	//To handle login/logout
	app.watchUser = function watchUser(dbURL, callback){
		app(dbURL)
			.auth()
			.onAuthStateChanged(function (user){
				if (user){
					handleCallback(user, callback);
				}
				else{
					handleError("No user", fail);
				}
			});
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
Exports
=======
*/
	module.exports = app;