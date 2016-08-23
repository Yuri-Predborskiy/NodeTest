var mongoose = require('mongoose');

// document for users
var schema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	middleName: String,
	branch: String,
	position: String,
	username: String,
	hash: String
});

schema.statics.findByUsername = function findByUsername (username, callback) {
	return this.findOne({ username: new RegExp('^'+username+'$', "i") }, callback);
};

var model = mongoose.model('users', schema);

exports.UserModel = model;
