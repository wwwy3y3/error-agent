## about Error-agent
error agent is a module help you deal with the errors, and respond them to http client

## install
	npm install error-agent


## how to use

when dealing with errors, many people simply use string, instead of Error object, which is not appropiate

you need to use Error object, attached with some properties, so you know how to deal with it later

so, when you're in async code


```javascript
var errorAgent= require('error-agent');

DB.queryUser(function(err, userData){
	if(!userData.auth) //if this user is not authenticated to read this page
		callback( errorAgent.handle({ status: 403, msg: 'you need to sign in to see' }) )  //callback an error
})
```

or simply throw

```javascript
if(!userData.auth)
	throw errorAgent.handle({ status: 403, msg: 'you need to sign in to see' });
```

as you might guess, `errorAgent.handle` return an `Error object` with the properties you pass in

### send error message to client

you should call it at your last callback

and pass the error object to `use`, pass `req`, `res` to `send`

it will deal with it for you

```javascript
errorAgent.send(err, req, res);
```


### using `code` property

you can use code property, so you can register a function to deal with certain error `code`


```javascript
if(user.hasNoName)
	throw errorAgent.handle({code: 'USER_NONAME'});
```

register a code error handler first


```javascript
ErrorAgent.register('USER_NONAME', function (req, res) {
	res.send('you got no name!');
});
```


### use error file instead of register

just give a file path, that will exports error code handlers

would be better

```javascript
ErrorAgent.config({ codesPath: __dirname + '/errors.js' })
```

### express example
[see here](https://github.com/wwwy3y3/error-agent/tree/master/test/test-express "express example")


### todo
*	error page folder path
