/* The express user service encapsulates all data access 
 * for users behind a simple interface. 
 * It exposes methods for CRUD operations and user authentication.*/

var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongoose = require('mongoose');
var db = mongoose.createConnection(config.dbServer, config.dbName);
var Users = db.model('User', require('../models/user.model.js').UserModel);

var service = {};

function authenticate(username, password) {
	var deferred = Q.defer();
	
	Users.findByUsername(username, function(err, user) {
		if (err) { deferred.reject(err); }
		if (user && bcrypt.compareSync(password, user.hash)) {
			deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
		} else {
			deferred.resolve();
		}
	});
	
	return deferred.promise;
}

function getById(_id) {
	var deferred = Q.defer();
	
	Users.findById(_id, function(err, user) {
		if (err) { deferred.reject(err); }
		
		if (user) {
			deferred.resolve(_.omit(user, 'hash'));
		} else {
			deferred.resolve();
		}
	});
	
	return deferred.promise;
}

// user is admin function - then = admin, catch = not admin or not found
function userIsAdmin(_user) {
	var deferred = Q.defer();
	Users.findById(_user, { admin: true }, function(err, user) {
		if(err) {
			deferred.reject(err);
		}
		if(user && user.admin) {
			deferred.resolve();
		} else {
			deferred.reject();
		}
	});
	return deferred.promise;
}

function getAll(_user) {
	// get all users from the database
	var deferred = Q.defer();
	userIsAdmin(_user)
	.then(function() {
		Users.find({}, { hash: false }, { lean: true }, function(err, users) {
			// find all users
			if (err) { deferred.reject(err); }
			if (users) {
				deferred.resolve(users);
			} else {
				// this should never happen
				deferred.resolve({ error: true, errorCode: 500, errorMessage: "No users found" });
			}
		});
	})
	.catch(function(err) {
		// user is not admin
		deferred.resolve({ error: true, errorCode: 401, errorMessage: "not authorized" });
	});
	return deferred.promise;
}

function create(userParams) {
	// initialize variables
	var deferred = Q.defer();
	
	function createUserMongoose() {
		var userData = _.omit(userParams, 'password');
		userData.hash = bcrypt.hashSync(userParams.password, 10);
		var user = new Users(userData);
		user.save(function (err, doc) {
			if (err) { deferred.reject(err); }
			deferred.resolve();
		});
		
	}
	
	// check if user exists, if not - save to DB
	Users.findByUsername(
		userParams.username,
		function(err, user) {
			if(err) { deferred.reject(err); }
			
			if(user) {
				deferred.reject('Username "' + userParams.username + '" is already taken');
			} else {
				createUserMongoose();
			}
		}
	);
	
	return deferred.promise;
}

function update(_id, userParams) {
	var deferred = Q.defer();
	
	// validation
	Users.findById(_id, function (err, user) {
		// initialize variables and methods first
		function updateUser() {
			// fields to update
			user.firstName = userParams.firstName;
			user.lastName = userParams.lastName;
			user.middleName = userParams.middleName;
			user.position = userParams.position;
			user.branch = userParams.branch;
			
			// update password if it was entered
			if (userParams.password) {
				user.hash = bcrypt.hashSync(userParams.password, 10);
			}
			
			user.save(function (err) {
				if (err) { deferred.reject(err); }
				deferred.resolve();
			});
		}

		if (err) { deferred.reject(err); }
		
		if (user.username !== userParams.username) {
			// username has changed so check if the new username is taken
			Users.findByUsername(userParams.username, function(err, user) {
				if (err) { deferred.reject(err); }
				if (user) {
					// username already exists
					deferred.reject('Username "' + userParams.username + '" is already taken');
				} else {
					updateUser();
				}
			});
		} else {
			updateUser();
		}
	});
	
	return deferred.promise;
}

function _delete(_id) {
	var deferred = Q.defer();
	
	Users.findByIdAndRemove(_id, function (err) {
		if (err) { deferred.reject(err); }
		
		deferred.resolve();
	});
	
	return deferred.promise;
}

function updateAdminStatus(_user, userIds, newValue) {
	var deferred = Q.defer();
	userIsAdmin(_user)
	.then(function() {
		var query = { _id: { $in: userIds.map(mongoose.Types.ObjectId) } };
		Users.update(query, { admin: newValue }, { multi: true }, function(err, data) {
			if(err) {
				deferred.reject(err);
			}
			deferred.resolve();
		});
	})
	.catch(function() {
		deferred.resolve({ error: true, errorDetails: "Not authorized" });
	});
	return deferred.promise;
}

function updateActiveState(_user, userIds, newValue) {
	var deferred = Q.defer();
	userIsAdmin(_user)
	.then(function() {
		var query = { _id: { $in: userIds.map(mongoose.Types.ObjectId) } };
		Users.update(query, { active: newValue }, { multi: true }, function(err, data) {
			if(err) {
				console.log("error setting active flag to " + newValue + " on users: " + err);
				deferred.reject(err);
			}
			deferred.resolve();
		});
	})
	.catch(function() {
		deferred.resolve({ error: true, errorDetails: "Not authorized" });
	});
	return deferred.promise;
}

service.authenticate = authenticate;
service.getById = getById;
service.getAll = getAll;
service.create = create;
service.update = update;
service.delete = _delete;
service.updateAdminStatus = updateAdminStatus;
service.updateActiveState = updateActiveState;

module.exports = service;
