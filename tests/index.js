var config = require('./config.json')
var mysql = require('mysql')
var CRUD = require('sc-crud-mysql')
var async = require('async')
var crud = null

console.log('Testing sc-crud-mysql',config)
async.series([
	// Establishing connection to test database
	cb => {
		console.log('Attempting to establish connection to database.')
		crud = new CRUD.SCCRUDMysql(config)
		console.log('Successfully connected!')
		return cb()
	},
	// CREATE
	cb => {
		var user = {
			first:'John',
			last:'Doe'
		}
		var qry = {
			table:'users',
			post:user
		}
		crud.create(qry,(err,rows) => {
			if (err) {
				console.log('Test failed...')
				return console.log(err)
			}
			console.log(rows)
		})
	}
],() => {
	console.log('Successfully completed all tests!')
})