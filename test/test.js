'use strict';

/*
Imports
=======
*/
//Test framework
var test = require('tape');

//Module to test
var app = require('../js/app.js');

//Data
var config = require('./data/config.js');
var dbURL = config.databaseURL;
var credentials = require('./data/credentials.js');
var profile = {displayName : 'HelloWorld'}

/*
Tests
=====
*/
test('Initialise app - app', function (assert){
    assert.plan(2);
    
	var init = app(config);
	
	assert.ok(typeof init === 'object', 'Database reference object created.');
	assert.ok(init.auth, 'Database reference - verified.');
});

test('Create new user - app.addUser', function (assert){
    assert.plan(1);

	app.addUser(dbURL, credentials[0], function(){
		assert.ok(true, 'Created new user.');
	});
});

test('Logout user - app.logoutUser', function (assert){
    assert.plan(1);

	app.logoutUser(dbURL, function(){
		assert.ok(true, 'Logged out user.');
	});
});

test('Login user - app.loginUser', function (assert){
    assert.plan(1);

	app.loginUser(dbURL, credentials[0], function(){
		assert.ok(true, 'Logged in user.');
	});
});

test('Get user object - app.getUser', function (assert){
    assert.plan(1);

	app.getUser(dbURL, function(user){
		assert.ok(user, 'Got user object.');
	});
});

test('Update user - app.updateUser', function (assert){
    assert.plan(2);

	app.updateUser(dbURL, profile, function(){
		assert.ok(true, 'Update user profile.');
		app.getUser(dbURL, function(user){
			assert.ok(user.displayName === profile.displayName, 'Update user profile - verified.');
		});
	});
});

test('Update user email - app.updateUserEmail', function (assert){
    assert.plan(3);

	app.updateUserEmail(dbURL, credentials[1].email, function(){
		assert.ok(true, 'Changed user email.');
		app.logoutUser(dbURL, function(){
			assert.ok(true, 'Logged out.');
			app.loginUser(dbURL, 
							{
							email : credentials[1].email,
							password : credentials[0].password
							}, 
							function(){
								assert.ok(true, 'Logged in with new email.');
							});
		});
	});
});

test('Update user password - app.updateUserPassword', function (assert){
    assert.plan(3);
	
	app.updateUserPassword(dbURL, credentials[1].password, function(){
		assert.ok(true, 'Changed user password.');
		app.logoutUser(dbURL, function(){
			assert.ok(true, 'Logged out.');
			app.loginUser(dbURL,credentials[1],function(){
				assert.ok(true, 'Logged in with new password.');
			});
		});
	});
});

test('Remove user - app.removeUser', function (assert){
    assert.plan(2);

	app.removeUser(dbURL, function(){
		assert.ok(true, 'User removed.');
		
		app.loginUser(dbURL,credentials[1],null,function(error){
			assert.ok(error, 'User removed - verified.');
		});
	});
});

//-----READ & WRITE + EVENTS-----

var dataList = [
				{hello: "world"},
				0,
				"foo"
				];

var dataInt = 0;
var dataStr = "bar";
var dataObj = {hello:"world"};

test('Write data - app.set', function (assert){
    assert.plan(3);
        
	app.set(dbURL + '/test/int', dataInt, function(){
		assert.ok(true, 'Integer written.');
	});	
	
	app.set(dbURL + '/test/str', dataStr, function(){
		assert.ok(true, 'String written.');
	});	

	app.set(dbURL + '/test/obj', dataObj, function(){
		assert.ok(true, 'Object written.');
	});
});

test('Read data - app.get', function (assert){
	assert.plan(4);
        
    app.get(dbURL + '/test/int', function(snapshot){
	    assert.equal(snapshot.val(), dataInt, 'Read integer.');
    });	
    
    app.get(dbURL + '/test/str', function(snapshot){
	    assert.equal(snapshot.val(), dataStr, 'Read string.');
    });	

    app.get(dbURL + '/test/obj', function(snapshot){
	    assert.deepEqual(snapshot.val(), dataObj, 'Read object.');
    });	
    
    app.get(dbURL + '/test/int/', function(snapshot){
	    assert.equal(snapshot.val(), dataInt, 'Read with / at end.');
    });	
});

/*
Disconnect from Firebase
https://github.com/substack/tape/issues/216
*/
test.onFinish(function() { 
  process.exit(0)
});