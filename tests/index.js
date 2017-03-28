var config = require('./config.json')
var mysql = require('mysql')
var CRUD = require('sc-crud-mysql')
var async = require('async')
var crud = null

var new_users = [] 

console.log('Testing sc-crud-mysql',config)
async.series([
	// Establishing connection to test database
	cb => {
		console.log('Attempting to establish connection to database.')
		crud = new CRUD.SCCRUDMysql(config)
		console.log('Successfully connected!')
		return cb()
	},
	// Clear users table
	cb => {
		console.log('Truncating users table.')
		crud._pool.query(`TRUNCATE users`,cb)
	},
	// CREATE
	cb => {
		console.log('Testing create')
		var user = {
			first:'John',
			last:'Doe'
		}
		var qry = {
			table:'users',
			post:user
		}
		async.timesLimit(10,5,(i,next) => {
			qry.post.email = qry.post.first + '-' + qry.post.last + '@email.com'
			crud.create(qry,(err,newly_created_user) => {
				if (err) {
					console.log('Test failed...')
					return console.log(err)
				}
				new_users.push(newly_created_user)
				return next()
			})
		},() => {
			console.log('Testing create complete!')
			return cb()
		})
	},
	// UPDATE
	cb => {
		console.log('Testing update')
		var qry = {
			table:'users',
			put:{
				email:'UPDATED_SUCCESSFULLY!'
			},
			conditionals:[
				{
					field:'id',
					operator:'<=',
					value:5
				}
			]
		}
		crud.update(qry,(err,newly_updated_user) => {
			if (err) {
				console.log('Test failed...')
				return console.log(err)
			}
			crud._pool.query(`SELECT email FROM users LIMIT 1 OFFSET 2`,(err2,rows2) => {
				if (err2) {
					console.log('Test failed...')
					return console.log(err2)
				}
				crud._pool.query(`SELECT email FROM users LIMIT 1 OFFSET 7`,(err3,rows3) => {
					if (err3) {
						console.log('Test failed...')
						return console.log(err3)
					}
					if (
						!rows2 || 
						!rows2.length || 
						!rows3 || 
						!rows3.length || 
						rows2[0].email == rows3[0].email
					) {
						return console.log('Testing failure during update...')
					} else {
						console.log('Testing update complete!')
						return cb()
					}
				})
			})
		})
	},
	// DELETE
	cb => {
		console.log('Testing delete')
		crud._pool.query(`SELECT COUNT(*) AS num FROM users`,(err,rows) => {
			if (err) {
				console.log('Test failed...')
				return console.log(err)
			}
			var num = rows && rows.length ? rows[0].num : 0
			if (!num) { return console.log('Testing delete failed!! Unable to query num of users.') }
			var qry = {
				table:'users',
				conditionals:[
					{
						field:'id',
						operator:'=',
						value:5
					}
				]
			}
			crud.delete(qry,err2 => {
				if (err2) {
					console.log('Test failed...')
					return console.log(err2)
				}
				crud._pool.query(`SELECT COUNT(*) AS num FROM users`,(err3,rows3) => {
					if (err3) {
						console.log('Test failed...')
						return console.log(err3)
					}
					var num2 = rows3 && rows3.length ? rows3[0].num : 0
					if (+num == +num2) { return console.log('Testing delete failed!') }
					console.log('Testing delete complete!')
					return cb()
				})
			})
		})
	}
],() => {
	console.log('Successfully completed all tests!')
})