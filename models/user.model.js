var mongoose = require('mongoose');

// document for users
var schema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	middleName: String,
	branch: { type: String, required: true },
	position: { type: String, required: true },
	username: { type: String, required: true },
	hash: {type: String, required: true },
	admin: {type: Boolean, default: false },
	active: {type: Boolean, default: false }
});

schema.statics.findByUsername = function findByUsername (username, callback) {
	return this.findOne({ username: new RegExp('^'+username+'$', "i") }, callback);
};

exports.UserModel = mongoose.model('User', schema);
