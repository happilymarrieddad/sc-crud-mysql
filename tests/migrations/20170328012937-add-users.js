var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
	async.series([
		db.createTable.bind(db,'users', {
			id: { type: "int", primaryKey:true, autoIncrement: true, notNull: true },
			timestamp: { type: "timestamp" },
			first: { type: "string", length:100 },
			last: { type: "string", length:100 },
			email: { type: "string", length:100 },
			mobile: { type: "string", length:20 },
			phone: { type: "string", length:20 },
			password: { type: "string", length:100 },
			status_id: { type: "int", length:11 },
			on_shift: { type: "int", length:11 },
			type_id: { type: "int", length:11 },
			last_login: { type: "timestamp" },
			reset_pass: { type: "string", length:100 },
			carrier_id: { type: "int", length:11 },
			timezone: { type: "string", length:100 },
			latitude: { type: "string", length:100 },
			longitude: { type: "string", length:100 },
			gps_bearing: { type: "string", length:100 },
			gps_speed: { type: "string", length:100 },
			gps_timezone: { type: "timestamp" },
			requirements: { type: "string", length:100 },
			customer_id: { type: "int", length:11 },
			is_transportation: { type: "smallint", length:1 },
			is_sales: { type: "smallint", length:1 },
			owner_id: { type: "int", length:11 },
			accounting_id: { type: "string", length:100 },
			visible: { type: "smallint", length:1 }
		}),
        db.addIndex.bind(db, 'users','users_pk', ['id'], 'unique')
	], callback);
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};