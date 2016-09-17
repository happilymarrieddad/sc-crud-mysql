/*
	MySQL Database ORM
*/

var Lynchpin = function(options) {
	var self = this

	// Set some default values
	var default_options = {
		host:'localhost',
		user:'root',
		password:'password',
		database:'mysql'
	}

	// Overwrite the default values with passed in values
	if (typeof options == 'object') {
		for (var key in options) {
			if (options.hasOwnProperty(key)) {
				default_options[key] = options[key]
			}
		}
	}

	// We grab a MySQL pool instance
	self._pool = require('mysql').createPool(default_options)
}

/*
* Index
* 	Gets all records from a table.
*/
Lynchpin.prototype.index = function(args,respond) {
	var self = this,
		qry = 'SELECT * FROM ??',
		params = [self._table],
		i = 0
	args = args || {}
	for (var key in args.fields) {
		if (i > 0) { qry += ' AND ' + key + ' = ?' }
		else { qry += ' WHERE ' + key + ' = ?' }
		params.push(args.fields[key])
		i++
	}
	if (args.limit) {
		qry += ' LIMIT ' + args.limit
	}
	if (args.offset) {
		qry += ' OFFSET ' + args.offset
	}
	self._pool.query(args.qry || qry,params,function(err,rows) {
		if (err) { return respond(err) }
		return respond(null,rows)
	})
}


/*
* Find
* 	Find a record from a table.
*/
Lynchpin.prototype.find = function(id,respond) {
	var self = this
	self._pool.query('SELECT * FROM ?? WHERE id = ?',[self._table,id],function(err,rows) {
		if (err) { return respond(err) }
		return respond(null, (rows.length ? rows[0] : null) )
	})
}

/*
* FindBy
* 	Gets all records from a table matching the passed in fields.
*/
Lynchpin.prototype.findBy = function(fields,respond) {
	var self = this
	var qry = 'SELECT * FROM ??',
		params = [self._table],
		i = 0
	for (var key in fields) {
		if (i > 0) { qry += ' AND ' + key + ' = ?' }
		else { qry += ' WHERE ' + key + ' = ?' }
		params.push(fields[key])
		i++
	}
	self._pool.query(qry,params,function(err,rows) {
		if (err) { return respond(err) }
		return respond(null,rows)
	})
}

/*
* FindByAnd
* 	Duplicate of FindBy.
*/
Lynchpin.prototype.findByAnd = function(fields,respond) {
	var self = this
	var qry = 'SELECT * FROM ??',
		params = [self._table],
		i = 0
	for (var key in fields) {
		if (i > 0) { qry += ' AND ' + key + ' = ?' }
		else { qry += ' WHERE ' + key + ' = ?' }
		params.push(fields[key])
		i++
	}
	self._pool.query(qry,params,function(err,rows) {
		if (err) { return respond(err) }
		return respond(null,rows)
	})
}

/*
* FindByOr
* 	Same as FindBy but it uses OR instead of AND.
*/
Lynchpin.prototype.findByOr = function(fields,respond) {
	var self = this
	var qry = 'SELECT * FROM ??',
		params = [self._table],
		i = 0
	for (var key in fields) {
		if (i > 0) { qry += ' OR ' + key + ' = ?' }
		else { qry += ' WHERE ' + key + ' = ?' }
		params.push(fields[key])
		i++
	}
	self._pool.query(qry,params,function(err,rows) {
		if (err) { return respond(err) }
		return respond(null,rows)
	})
}

/*
* Store
* 	Store a record and return it after completion.
*/
Lynchpin.prototype.store = function(post,respond) {
	var self = this
	self._pool.query('INSERT INTO ?? SET ?',[self._table,post],function(err,rows) {
		if (err) { return respond(err) }
		self.find(rows.insertId,respond)
	})
}

// Locate record if not found create it and return it
Lynchpin.prototype.firstOrCreate = function(fields,respond) {
	var self = this
	self.findBy(fields,function(err,records) {
		if (err) { return respond(err) }
		else if (rows.length) { return respond(null,records[0]) }
		else {
			self.store(fields,function(err2,new_obj) {
				if (err) { return respond(err2) }
				self.find(new_obj.id,respond)
			})
		}
	})
}

// // Locate record if not found NOT create it and return it
// Lynchpin.prototype.firstOrNew = function(respond) {
	
// }

/*
* Update
* 	Update a record and return it after completion.
*/
Lynchpin.prototype.update = function(id,put,respond) {
	var self = this
	self._pool.query('UPDATE ?? SET ? WHERE id = ?',[self._table,put,id],function(err,rows) {
		if (err) { return respond(err) }
		self.find(id,respond)
	})
}

/*
* Destroy
* 	Destroy a record.
*/
Lynchpin.prototype.destroy = function(id,respond) {
	var self = this
	self._pool.query('DELETE FROM ?? WHERE id = ?',[self._table,id],function(err,rows) {
		if (err) { return respond(err) }
		return respond(null)
	})
}

module.exports = Lynchpin