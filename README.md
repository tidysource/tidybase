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
Returns the current user object
| Parameter     | Type     | 
| ------------- | -------- |
| dbURL         | `string` |

`dbPath` URL of the database.

```javascript
var dbURL = 'https://<YOUR_DATABASE_NAME>.firebaseio.com'; 
var uuid = app(dbPath);
