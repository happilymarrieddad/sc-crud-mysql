var async = require('async'),
	mysql = require('mysql'),
	cache = require('mysql-cache'),
	Filter = require('./filter'),
	bcrypt = require('bcrypt')

var SCCRUDMysql = function(options) {
	var self = this
	options = options || {}

	this.db_config = {
		host:'localhost',
		port:3306,
		user:'root',
		password:'psw',
		database:'mysql',
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
	this.schema = options.schema || null
	this.debug = options.debug || false
	this.worker = options.worker || {}
	this.cacheEnabled = options.cacheEnabled || false
	this.encryptPasswords = options.encryptPasswords || true
	if (options.encryption && typeof encryption == 'function') {
		this._encrypt = options.encryption
	} 
	if (options.verifyEncryption && typeof verifyEncryption == 'function') {
		this._verifyEncryption = options.verifyEncryption
	} 

	this._init(options)
}


SCCRUDMysql.prototype = Object.create({})

SCCRUDMysql.prototype._init = function(options) {
 	this._init_pool(options)
 	this._init_worker(options,this.worker)
}

/*
	Name - INIT POOL
	@summary - This function sets the database connection so that 
			 - queries can easily be managed by SC-Crud-MySQL
	@params  - options.pool
					- The pool options is best as an instance of
					either mysql.createPool() or mysqlClusterFarm()
*/
SCCRUDMysql.prototype._init_pool = function(options) {
	if (options.pool) {
		this._pool = options.pool
	} else if (this.cacheEnabled) {
		cache.init({
			host: options.db.host || 'localhost',
		    user: options.db.user,
		    password: options.db.password,
		    database: options.db.database,
		    TTL: options.db.ttl || 0,
		    connectionLimit: options.db.connectionLimit || 10000,
		    verbose: options.db.verbose || false,
		    caching: true 
		})
		this._pool = cache
	} else {
		if (
			!options.db ||
			!options.db.user ||
			!options.db.password ||
			!options.db.database
		) { throw new Error('SCCRUDMysql requires a db parameter with valid connection data in order to work.') }
	 	
	 	for (var key in this.db_config) {
	 		if (this.db_config.hasOwnProperty(key)) {
	 			this.db_config[key] = options.db[key]
	 		}
	 	}

	 	// This needs to be added above... I wasn't sure about the default setting for these options. The documentation isn't very clear.
	 	if (options.db.hasOwnProperty('queryFormat')) { this.db_config['queryFormat'] = options.db['queryFormat'] }
	 	if (options.db.hasOwnProperty('flags')) { this.db_config['flags'] = options.db['flags'] }
	 	if (options.db.hasOwnProperty('ssl')) { this.db_config['ssl'] = options.db['ssl'] }

		this._pool = mysql.createPool(this.db_config)
	}
 	this._init_schema(options)
}

SCCRUDMysql.prototype._init_schema = function(options) {

}

SCCRUDMysql.prototype._init_worker = function(options,worker) {
	var self = this
	this.scServer = worker.scServer || {}
	this.brokerEngine = this.scServer.brokerEngine || {}
	this._init_cache()

	if (this.scServer && this.scServer.exchange) {
		this.filter = new Filter(this.scServer)
		this.publish = this.scServer.exchange.publish.bind(this.scServer.exchange)

		// Here we are going to update the cache when publish is made
		this.scServer.exchange.publish = function(channel,data,callback) {
			// Check to see if crud is at the begining of the message
			if (channel && channel.indexOf && channel.indexOf('crud>') == 0) {
				console.log('')
				console.log(channel)
				console.log(data)
				console.log('')
				if (data == null) {
					// Clear cache
				} else {
					// Update cache
				}
			}
			self.publish.apply(self.scServer.exchange,arguments)
		}

		this.scServer.on('_handshake',function(socket) {
			console.log('Initiate handshake')
			self._attachSocket(socket)
		})
	} else {
		this.publish = function(){}
	}
}

SCCRUDMysql.prototype._init_cache = function(respond) {

}

SCCRUDMysql.prototype._encrypt = function(val) {
	if (!val || typeof val != 'string') { return respond('Value must be a valid string.') }
	return bcrypt.hashSync(val,bcrypt.genSaltSync(10))
}

SCCRUDMysql.prototype._verifyEncryption = function(val,hash) {
	return bcrypt.compareSync(val,hash)
}

SCCRUDMysql.prototype._isObjectEmpty = function(obj) {
  for(var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}


SCCRUDMysql.prototype.unique = function(qry,cb,socket) {
	var self = this
	var pool = this._pool
	self.find(qry.id,qry.unique_by || 'id',qry.table,function(err,objs) {
		if (err) { return cb(err) }
		if (objs && objs.length) { return cb('Unable to create. Already exists.') }
		delete qry.unique
		self.create(qry,cb,socket)
	})
}

SCCRUDMysql.prototype.first = function(id,primary_key,table,cb) {
	var self = this
	var pool = this._pool
	if (!primary_key) { primary_key = 'id' }
	pool.query('SELECT * FROM ?? WHERE ?? = ?',[table,primary_key,id],function(err,rows) {
		if (err) { return cb(err) }
		if (!rows.length) { return cb(null,{}) }
		return cb(null,rows[0])
	})
}

SCCRUDMysql.prototype.find = function(id,primary_key,table,cb) {
	var self = this
	var pool = this._pool
	if (!primary_key) { primary_key = 'id' }
	pool.query(`SELECT * FROM ?? WHERE ?? = ?`,[table,primary_key,id],function(err,rows) {
		if (err) { return cb(err) }
		if (!rows.length) { return cb(null,{}) }
		return cb(null,rows)
	})
}

SCCRUDMysql.prototype.fields = function(table,cb) {
	var self = this
	var pool = this._pool
	pool.query('DESCRIBE ??',[table],function(err,rows) {
		if (err) { return cb(err) }
		var fields = []
		rows.forEach(function(field,index){
			fields.push(field.Field)
		})
		return cb(null,fields)
	})
}

/*
@params -
	unique - bool - Whether the passed in object should be unique or not
	table - string - Name of the table to add the obj to
	post - object - The object to be created

TODO: Need to add checks to make sure the table can accept the parameters passed in
*/
SCCRUDMysql.prototype.create = function(qry,cb,socket) {
	var self = this
	var pool = this._pool
	if (qry.unique) { return self.unique(qry,cb,socket) }

	if (this.encryptPasswords) {
		for (var key in qry.post) {
			if (qry.post.hasOwnProperty(key) && key.toLowerCase() == 'password') {
				qry.post[key] = self._encrypt(qry.post[key])
			}
		}
	}

	pool.query('INSERT INTO ?? SET ?',[qry.table,qry.post],function(err,rows) {
		if (err) { return cb(err) }
		self.first(rows.insertId,qry.unique_by || 'id',qry.table,function(err2,obj) {
			if (err2) { return cb(err2) }
			return cb(null,obj)
		})
	})
}

SCCRUDMysql.prototype.read = function(qry,cb,socket) {
	var self = this
	var pool = this._pool
	var query = 'SELECT * FROM ?? '
	var values = [qry.table]

	if (qry.conditionals) {
		qry.conditionals.forEach(function(conditional,index) {
			if (typeof conditional != 'object') { return cb('Query conditionals must be an array of objects. Please refer to the documentation.') }
			if (!conditional.custom && (!conditional.field || !conditional.value)) {
				return console.log('conditional for',qry.table,'read is invalid and being ignored.')
			} // We ignore this object because it has no field
			if (conditional.custom) {
				query += ' ' + conditional.custom + ' '
			} else {
				if (index < 1) { query += 'WHERE ' }
				else {
					var condition = 'AND'
					if (conditional.condition) {
						condition = conditional.condition
					}
					query += condition + ' '
				}
				var field = conditional.field
				var operator = conditional.operator || '='
				var value = conditional.value || 'NULL'
				query += field + ' ' + operator + ' ?'
				values.push(value)
			}
		})
	}

	if (qry.limit) {
		query += ' LIMIT ' + limit
	}

	if (qry.offset) {
		query += ' OFFSET ' + offset
	}

	pool.query(query,values,cb)
}


/*
	@oarams
		table - Table to update
		conditionals - array of objects
			{
				condition:'AND',
				field:'type_id',
				operator:'=',
				value:'1'
			}
			OR
			{
				custom:'AND type_id IN (1,4,5)'
			}
*/
SCCRUDMysql.prototype.update = function(qry,cb,socket) {
	var self = this
	var pool = this._pool
	self.fields(qry.table,function(err,fields) {
		if (err) { return cb(err) }
		var new_obj = {}
		var put = qry.put || {}

		if (this.encryptPasswords) {
			for (var key in put) {
				if (put.hasOwnProperty(key) && key.toLowerCase() == 'password') {
					put[key] = self._encrypt(put[key])
				}
			}
		}

		var values = [qry.table]
		fields.forEach(function(field,index) {
			if (put.hasOwnProperty(field)) {
				new_obj[field] = put[field]
			}
		})
		var query = 'UPDATE ?? '
		var set = 'SET '
		for (var key in new_obj) {
			if (new_obj.hasOwnProperty(key)) {
				set += key + ' = ?,'
				values.push(new_obj[key])
			}
		}
		set = set.substr(0,set.length-1)
		query += set + ' '

		if (qry.conditionals) {
			qry.conditionals.forEach(function(conditional,index) {
				if (typeof conditional != 'object') { return cb('Query conditionals must be an array of objects. Please refer to the documentation.') }
				if (!conditional.custom && (!conditional.field || !conditional.value)) {
					return console.log('conditional for',qry.table,'update is invalid and being ignored.')
				} // We ignore this object because it has no field
				if (conditional.custom) {
					query += ' ' + conditional.custom + ' '
				} else {
					if (index < 1) { query += 'WHERE ' }
					else {
						var condition = 'AND'
						if (conditional.condition) {
							condition = conditional.condition
						}
						query += condition + ' '
					}
					var field = conditional.field
					var operator = conditional.operator || '='
					var value = conditional.value || 'NULL'
					query += field + ' ' + operator + ' ?'
					values.push(value)
				}
			})
		}

		pool.query(query,values,cb)
	})
}

SCCRUDMysql.prototype.delete = function(qry,cb,socket) {
	var self = this
	var pool = this._pool
	var query = 'DELETE ' + (qry.delete_from || '') + ' FROM ?? '
	var values = [qry.table]

	if (qry.conditionals) {
		qry.conditionals.forEach(function(conditional,index) {
			if (typeof conditional != 'object') { return cb('Query conditionals must be an array of objects. Please refer to the documentation.') }
			if (!conditional.custom && (!conditional.field || !conditional.value)) {
				return console.log('conditional for',qry.table,'delete is invalid and being ignored.')
			} // We ignore this object because it has no field
			if (conditional.custom) {
				query += ' ' + conditional.custom + ' '
			} else {
				if (index < 1) { query += 'WHERE ' }
				else {
					var condition = 'AND'
					if (conditional.condition) {
						condition = conditional.condition
					}
					query += condition + ' '
				}
				var field = conditional.field
				var operator = conditional.operator || '='
				var value = conditional.value || 'NULL'
				query += field + ' ' + operator + ' ?'
				values.push(value)
			}
		})
	}
	pool.query(query,values,cb)
}

SCCRUDMysql.prototype.query = function(qry,values,cb) {
	var self = this
	var pool = this._pool
	pool.query(qry,values,cb)
}


/*
	Name - _attachSocket
	@summary - Here we attach the socket to basic crud
				types. This function is also responsible
				for validation for crud requests.
*/
SCCRUDMysql.prototype._attachSocket = function (socket) {
	var self = this

	/*
		query : {
			id:1,
			type:'users',
			field:'first',
			value:'Nick'
		}

		TODO : Add validation for the query before it is
			   sent to the DB.
	*/

	socket.on('create', function (query, callback) {
		if (!query.table) { return callback('Table name is required to create a resource') }
		else if (!query.post || typeof query.post != 'object') { return callback('A post object is required to create a resource') }
		self.create(query, callback, socket)
	})
	socket.on('read', function (query, callback) {
		if (!query.table) { return callback('Table name is required to read a resource') }
		self.read(query, callback, socket)
	})
	socket.on('update', function (query, callback) {
		if (!query.table) { return callback('Table name is required to update a resource') }
		else if (!query.put || typeof query.put != 'object' || self._isObjectEmpty(query.put)) { return callback('A put object is required to create a resource') }
		self.update(query, callback, socket)
	})
	socket.on('delete', function (query, callback) {
		if (!query.table) { return callback('Table name is required to delete a resource') }
		self.delete(query, callback, socket)
	})
}

SCCRUDMysql.prototype.getPool = function() {
	return this._pool
}

module.exports.SCCRUDMysql = SCCRUDMysql

module.exports.attach = function(worker,options) {
	if (options) { options.worker = worker }
	else { options = { worker:worker } }
	if (!options.db) {
		options.db = {
			host:'localhost',
			user:'root',
			database:'mysql'
		}
		console.log('No database connection variables passed in. Default parameters used.')
	}
	return new SCCRUDMysql(options)
}