# This is an alpha build. It probably shouldn't be used in production quite yet.
### I could really use some strong testing if anyone has the time. Thanks!

## Changelog

- 0.4.0
  - Added expressions and joins to 'read'.

- 0.3.2
  - Fixed the documentation.

- 0.3.0
  - Allow for broadcasting back to clients.

- 0.2.3
  - Fixed the error with CREATE.

- 0.2.2
  - Added limit and offset to READ.

- 0.2.1
  - Added the ability to query server-side.

- 0.1.1
  - Added the ability to setup ecryption verification as well.

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
	},
	unique:true, // Whether or not the resource should be unique when being created
	unique_by:'id' // This is the unique primary key it will search for when grabbing the data after it has created a new resource
},function(err,new_user) {
	console.log(new_user)
})

socket.emit('update',{
	table:'users',
	put:{
		last:'Kotenberg 2'
	},
	// Optional
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


// If all you pass in is a table then you get 'SELECT * FROM ${table}'
socket.emit('read',{
	// Optional (you can pass in 'exp' or 'selects' if you don't like to type out 'expressions')
	expressions:[  // Defaults to ['*']
		'user_types.name as type_name',
		'users.*'
	],
	table:'users',
	// Optional
	joins:[
		{
			table:'user_types',
			conditionals:[
				{
					condition:'ON', // Defaults the first to 'ON' and every one after that defaults to 'AND'
					field:'user_types.id',
					operator:'=', // Defaults to '='
					value:'users.type_id'
				},
				{
					field:'user_types.id',
					operator:'>',
					value:'4'
				}
			]
		}
	],
	// Optional
	conditionals:[
		{
			field:'id',
			operator:'>', // Defaults to '='
			value:3
		}
	],
	limit:5,
	offset:5
},function(err,users) {
	console.log(users)
})

socket.emit('delete',{
	table:'users',
	delete_from:'users,user_types', // (Optional) - assumes the table if not passed in
	// Optional
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

// If broadcasting back to all clients (defaults to true)
var createWatcher = socket.subscribe('crud>create')
createWatcher.watch(function(data) {
	/*  Example
		{
			table:'users',
			post:{
				id:1,
				name:"Hugh Now",
				email:"hugh@mail.com"
			}
		}
	*/
	console.log(data)
})
var updateWatcher = socket.subscribe('crud>update')
updateWatcher.watch(function(data) {
	console.log(data.table)
	console.log(data.puts) // All the rows that were updated
})
var deleteWatcher = socket.subscribe('crud>delete')
deleteWatcher.watch(function(data) {
	console.log(data.table)
	console.log(data.deletes) // All the rows that were deleted
})


```

Write client-side models to handle complex operations =). So much win!

## SC-CRUD-Mysql Options

All options

Encryption is handled with bcrypt if no function is passed in. That is the preferred method but feel free to pass in your own function if you wish.

```js
scCrudMysql.attach(worker,{
	dontBroadcast:false, (Defaults to false) Whether or not crud should be broadcasted back to all clients 
	encryptPasswords:true, // (Defaults to true) Ecrypt anything passed into the system with the name password (case insensitive)
	encryption:function(val) { return (val * 2) }, // Defaults to bcrypt
	verifyEncryption:function(val,hash) { return (val * 2) == hash } // Defaults to bcrypt
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

## Querying server-side

You can query server-side if you need to. You use this just like the mysql module (pool)

```js
var sc_crud_mysql = scCrudMysql.attach(worker,{
    db:config.db
})

sc_crud_mysql.query('SELECT * FROM ??',['users'],function(err,users) {
	console.log(users)
})
```

## License

MIT

## Contributors

- Nick Kotenberg [github profile](https://github.com/happilymarrieddad)
