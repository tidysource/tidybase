# Tidybase

## What's Tidybase?
(For now) Tidybase is a light wrapper around the Firebase JS/Web API.

## Why Tidybase?
It enables less overhead if ever switching the storage system.
That way apps don't need to be updated, but rather the internals
of this API wrapper.

Secondly Tidybase offers me more consistency of the API methods as 
opposed to the original API. 

Last but not least, having a wrapper allows for small adjustments 
and optimisations based on personal preference. Writing/using code 
that looks and feels like your own has it's merits (productivity,
less errors, etc.).

## Synchronous code

### app()
Initialise app and/or return an app reference.

| Parameter     | Type                 | 
| ------------- | -------------------- |
| db	        | `string` or `object` |

`db`
Either database URL string (to get the reference) or config object 
(to initialise the app).

```javascript
/*
When referencing an app the first time you 
need to first initialise it. You do so by
passing a config object to app()

Note: 
Replace <YOUR_...> with the appropriate data
*/
var config = {
	apiKey: '<YOUR_API_KEY>',
	authDomain: '<YOUR_PROJECT_ID>.firebaseapp.com',
	databaseURL: 'https://<YOUR_DATABASE_NAME>.firebaseio.com',
	storageBucket: '<YOUR_BUCKET>.appspot.com',
	messagingSenderId: '<YOUR_SENDER_ID>',
};
var myApp = app(config);

/*
Every following time, we can reference the
app by using the value of config.databaseURL
*/
var dbURL = 'https://<YOUR_DATABASE_NAME>.firebaseio.com';
var myApp = app(dbURL);

/*
Note:
In both cases myApp is an app reference.
*/
```

### app.getUser()
Returns the current user object. If no user authenticated
it will return null.

| Parameter     | Type     | 
| ------------- | -------- |
| dbURL         | `string` |

`dbPath` URL of the database.

```javascript
var dbURL = 'https://<YOUR_DATABASE_NAME>.firebaseio.com'; 
var user = app.getUser(dbURL);
```

### app.uuid()
Returns a unique key. 
Returned keys keep a lexicographic order.

| Parameter     | Type     | 
| ------------- | -------- |
| dbPath        | `string` |

`dbPath` 
Path within the database under which 
the key is going to be applied. Put 
otherwise, where value will be stored.

```javascript
var dbPath = 'https://<YOUR_DATABASE_NAME>.firebaseio.com/foo/bar'; 
var uuid = app.uuid(dbPath);
```

## Promises
A useful explanation of [promises][1].

###app.addUser()
###app.updateUser()
###app.updateUserEmail()
###app.updateUserPassword()
###app.userEmailVerificationr()
###app.userEmailResetPassword()
###app.removeUser()
###app.loginUser()
###app.logoutUser()
###app.reauthUser()
###app.set()
###app.push()
###app.update()
Updates are transactional (either all succedd or all fail)
###app.get()
###app.remove()
###app.transaction()

## Events
### app.on()
### app.off()

## Internals
These functions are **not recommended to be used**.
They are useful for the wrapper code itself though.

### app.init()
### app.get()
### defined()
### parsePath()
### ref()
### app.list

---
## Notes: 
Get user returns null and so does getting any value (if nothing is at that path);
This is not an error, but a valid return value (think template).

[1]:https://developers.google.com/web/fundamentals/getting-started/primers/promises
