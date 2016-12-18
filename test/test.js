'use strict';

/*
Imports
=======
*/
//Test framework
var test = require('tape');

var colorize = require('tap-colorize');
var colorizeOptions = {
	pass : '#B2D9B5',
	fail : '#FE5A4E',
	info : '#EEEEEE'
};
test.createStream().pipe(colorize(colorizeOptions)).pipe(process.stdout);

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

	app.addUser(dbURL, credentials[0])
		.then(
			function(){assert.ok(true, 'Created new user.');},
			function(error){assert.fail(error);}
			);
});

test('Logout user - app.logoutUser', function (assert){
    assert.plan(1);

	app.logoutUser(dbURL)
		.then(
			function(){assert.ok(true, 'Logged out user.');},
			function(error){assert.fail(error);}
			);
});

test('Login user - app.loginUser', function (assert){
    assert.plan(1);

	app.loginUser(dbURL, credentials[0])
		.then(
			function(){assert.ok(true, 'Logged in user.');},
			function(error){assert.fail(error);}
			);
});

test('Get user object - app.getUser', function (assert){
    assert.plan(1);

	assert.ok(app.getUser(dbURL), 'Got user object.');
});

test('Update user - app.updateUser', function (assert){
    assert.plan(2);

	app.updateUser(dbURL, profile)
		.then(
			function(){assert.ok(true, 'Update user profile.')},
			function(error){assert.fail(error);}
			)
		.then(function(){
			var user = app.getUser(dbURL)
			assert.ok(user.displayName === profile.displayName, 
			'Update user profile - verified.');
		});
});

test('Update user email - app.updateUserEmail', function (assert){
    assert.plan(3);

	app.updateUserEmail(dbURL, credentials[1].email)
		.then(
			function(){assert.ok(true, 'Changed user email.');},
			function(error){assert.fail(error);})
		.then(
			function(){
				return app.logoutUser(dbURL);
			})
		.then(
			function(){assert.ok(true, 'Logged out.');},
			function(error){assert.fail(error);})
		.then(
			function(){
				return app.loginUser(dbURL, 
											{
											email : credentials[1].email,
											password : credentials[0].password
											});
			})
		.then(
			function(){assert.ok(true, 'Logged in with new email.');},
			function(error){assert.fail(error);});
});

test('Update user password - app.updateUserPassword', function (assert){
    assert.plan(3);
	
	app.updateUserPassword(dbURL, credentials[1].password)
		.then(
			function(){assert.ok(true, 'Changed user password.');},
			function(error){assert.fail(error);})
		.then(
			function(){
				return app.logoutUser(dbURL)
			})
		.then(
			function(){assert.ok(true, 'Logged out.');},
			function(error){assert.fail(error);})
		.then(
			function(){
				return app.loginUser(dbURL,credentials[1])
			})
		.then(
			function(){assert.ok(true, 'Logged in with new password.');},
			function(error){assert.fail(error);});
});

test('Remove user - app.removeUser', function (assert){
    assert.plan(2);

	app.removeUser(dbURL)
		.then(
			function(){assert.ok(true, 'User removed.');},
			function(error){assert.fail(error);})
		.then(function(){
			return app.loginUser(dbURL,credentials[1]);
		})
		.then(
			function(error){assert.fail('User NOT removed.');},
			function(error){assert.ok(error, 'User removed - verified.');});
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
        
	app.set(dbURL + '/test/int', dataInt)
		.then(
			function(){assert.ok(true, 'Integer written.');},
			function(error){assert.fail(error);}
			);	
	
	app.set(dbURL + '/test/str', dataStr)
		.then(
			function(){assert.ok(true, 'String written.');},
			function(error){assert.fail(error);}
			);	

	app.set(dbURL + '/test/obj', dataObj)
		.then(
			function(){assert.ok(true, 'Object written.');},
			function(error){assert.fail(error);}
			);
});

test('Read data - app.get', function (assert){
	assert.plan(4);
        
    app.get(dbURL + '/test/int')
    	.then(
	    	function(snapshot){
		    	assert.equal(snapshot.val(), dataInt, 
		    				'Read number.');
			},
			function(error){
				assert.fail(error);
			});
    
    app.get(dbURL + '/test/str')
    	.then(
	    	function(snapshot){
		    	assert.equal(snapshot.val(), dataStr, 
		    				'Read string.');
			},
			function(error){
				assert.fail(error);
			});

    app.get(dbURL + '/test/obj')
    	.then(
	    	function(snapshot){
		    	assert.deepEqual(snapshot.val(), dataObj, 
		    				'Read object.');
			},
			function(error){
				assert.fail(error);
			});
    
    app.get(dbURL + '/test/int/')
    	.then(
	    	function(snapshot){
		    	assert.equal(snapshot.val(), dataInt, 
		    				'Read width / at end.');
			},
			function(error){
				assert.fail(error);
			});	
});

test('Update data - app.update', function (assert){
	assert.plan(2);
    
    app.update(dbURL + '/test/', {'int' : 100})
	    .then(
	    	function(){assert.ok(true, 'Updated value.')},
			function(error){assert.fail(error);}
		)
		.then(function(){
			return app.get(dbURL + '/test/int');
		})
		.then(
			function(snapshot){
				assert.equal(snapshot.val(), 100, 'Update value verified.');
			},
			function(error){
				assert.fail(error);
			});
});

test('Push data - app.push', function (assert){
	assert.plan(dataList.length);
        
    for(var i=0; i<dataList.length; ++i){    
	    let val = dataList[i];
		app.push(dbURL + '/test/list/', val)
			.then(
				function(){assert.ok(true, 'Pushed ' + typeof val + '.');},
				function(error){assert.fail(error);}
				);
    }
});

test('UUID - app.uuid', function (assert){
	assert.plan(2);
        
    var id = app.uuid(dbURL + '/test/list/');
	app.set(dbURL + '/test/list/' + id, 'uuid')
		.then(
			function(){assert.ok(true, 'Object written.')},
			function(error){assert.fail(error);})
		.then(function(){
			return app.get(dbURL + '/test/list/' + id);
		})
		.then(
			function(snapshot){
				assert.equal(snapshot.val(), 
							'uuid', 'UUID used.');
			},
			function(error){
				assert.fail(error);
			});
});

test('Remove data - app.remove', function (assert){
	assert.plan(2);
	
	app.remove(dbURL + '/test/')
		.then(
			function(snapshot){assert.ok(true, 'Data removed.')},
			function(error){assert.fail(error);}
			)
		.then(function(){
			return app.get(dbURL + '/test/'); 
		})
		.then(
			function(snapshot){
		    	assert.equal(snapshot.val(), null,
		    				'Data removed - verified.');
			},
			function(error){
				assert.fail(error);
			}); 	
});

test('Events - app.on, app.off', function(assert){
	assert.plan(5 + //value event
				3 +	//value added
				1 +	//value changed
				1 +	//value moved
				1 +	//value removed
				1	//app.off() 
				);	
				
	var listPath = dbURL + '/test/list';
	
	app.on(listPath, 'value', function(cSnapshot){
		assert.ok(true, 'Value event.');
	});
	app.on(listPath, 'childAdded', function(cSnapshot){
		assert.ok(true, 'Value added.');
	});
	app.on(listPath, 'childChanged', function(cSnapshot){
		assert.ok(true, 'Value changed.');
	});
	app.on({
			at : listPath,
			orderBy : 'letter'
			}, 'childMoved', function(cSnapshot){
		assert.ok(true, 'Value moved.');
	});
	app.on(listPath, 'childRemoved', function(cSnapshot){
		assert.ok(true, 'Value removed.');
	});
	
	//Push data
	var pushId = null;
	var pushPath = null;
	app.push(listPath, {letter : 'a'})
		.then(
			function(){
				return app.push(listPath, {letter : 'b'})
			},
			function(error){
				assert.fail(error);
			})
		.then(
			function(){
				pushId = app.uuid(listPath);
				pushPath = listPath + '/' + pushId;
				return app.set(pushPath, {letter : 'c'});
			},
			function(error){
				assert.fail(error);
			})
		//Update list imtem
		.then(
			function(){
				var updatePath = listPath + '/' + pushId + '/' + 'letter';
				return app.update(updatePath, {letter : 'b'});
			},
			function(error){
				assert.fail(error);
			})
		//Remove list item
		.then(
			function(){
				return app.remove(pushPath);
			},
			function(error){
				assert.fail(error);
			})
		//Remove listeners
		.then(
			function(){
				app.off(listPath, 'value');
				assert.ok(true, 
							'Event listeners for ' + 
							listPath + ' removed.');
			},
			function(error){
				assert.fail(error);
			});
		//Remove list item (to confirm listeners removed) 
			//If wanted to check if all listeners removed should actually repead pushing and updatint too
		//Remove test data
});

//<--- transaction, verify push, handle fails, auth event!!

/*
Disconnect from Firebase
https://github.com/substack/tape/issues/216
*/
test.onFinish(function() { 
  process.exit(0)
});