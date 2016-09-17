# This is an alpha build. It probably shouldn't be used in production quite yet.
### I could really use some strong testing if anyone has the time. Thanks!

## Changelog

- 0.1.0
  - Finished intial build. Let me know what you think!
  - I've added encryption. Check out the options below for more details.

# sc-crud-mysql
Realtime CRUD data management layer/plugin for SocketCluster using MySQL as the database.

Somewhat of an example build above in the examples folder.

## Setup

This module is a plugin for SocketCluster, so you need to have SC installed: http://socketcluster.io/#!/docs/getting-started
Once SC is installed and you have created a new SC project, you should navigate to your project's main directory and run:

```bash
npm install sc-crud-mysql --save
```

## Initial Instructions

Setup your database however you wish. Allow me to suggest db-migrate to design your database.

## Attaching to your workers (server-side)

Now we need to attach the SC-CRUD-Mysql listener to the worker channels. Type in the following code in the worker.js file

```bash
var scCrudMysql = require('sc-crud-mysql')

module.exports.run = function (worker) {

	scCrudMysql.attach(worker,{
		db:{
			host:'localhost',
			user:'root',
			password:'password',
			database:'sccrudmysql_is_awesome'
		}
	})
}

```

## Using client side

```js

var socket = socketCluster.connect({
    hostname:'localhost',
    port:3000
})

socket.on('connect',function(status) {
	
})

socket.emit('create',{
	table:'users',
	post:{
		first:'Nick',
		last:'Kotenberg',
		email:'happilymarrieddad@gmail.com'
	}
},function(err,new_user) {
	console.log(new_user)
})

socket.emit('update',{
	table:'users',
	put:{
		last:'Kotenberg 2'
	},
	conditionals:[
		{
			field:'id',
			operator:'=',
			value:7}
		},
		{
			custom:'OR type_id NOT IN (2,6,7)'
		},
		{
			condition:'OR',
			field:'first',
			operator:'!=',
			value:'Daniel'
		}
	]
},function(err) {
	if (err) { console.log(err) }
})

socket.emit('read',{
	table:'users',
	conditionals:[
		{
			field:'id',
			operator:'>',
			value:3}
		}
	]
},function(err,users) {
	console.log(users)
})

socket.emit('delete',{
	table:'users',
	delete_from:'users,user_types', // (Optional) - assumes the table if not passed in
	conditionals:[
		{
			field:'id',
			operator:'=',
			value:7}
		}
	]
},function(err,new_user) {
	console.log(new_user)
})


```

Write client-side models to handle complex operations =). So much win!

## SC-CRUD-Mysql Options

All options

Encryption is handled with bcrypt if no function is passed in. That is the preferred method but feel free to pass in your own function if you wish. 

```js
scCrudMysql.attach(worker,{
	encryptPasswords:true, // (Defaults to true) Ecrypt anything passed into the system with the name password (case insensitive)
	encryption:function(val) { return (val * 2) } // Defaults to bcrypt
})
```

Not using cache for database

```js
scCrudMysql.attach(worker,{
	db:{
		host:'localhost',
		user:'root',
		password:'password',
		database:'sccrudmysql_is_awesome',
		port:3306,
		charset:'UTF8_GENERAL_CI',
		timezone:'local',
		connectTimeout:10000,
		stringifyObjects:false,
		insecureAuth:false,
		typeCast:true,
		queryFormat:'',
		supportBigNumbers:false,
		bigNumberStrings:false,
		dateStrings:false,
		debug:false,
		trace:true,
		multipleStatements:false
	}
})

```

Using cache

```js
scCrudMysql.attach(worker,{
	cacheEnabled:true,
	db:{
		host:'localhost',
		user:'root',
		password:'password',
		database:'sccrudmysql_is_awesome',
	    ttl: 0,
	    connectionLimit:10000,
	    verbose:false
	}
})

```

Using your own pool

```js
scCrudMysql.attach(worker,{
	pool:require('mysql').createPool({
		// whatever options you want
	})
})

```

## License

MIT

## Contributors

- Nick Kotenberg [github profile](https://github.com/happilymarrieddad)
