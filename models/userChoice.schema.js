var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema for user choices
var UserChoiceSchema = mongoose.Schema({
	_user: { type: Schema.ObjectId, ref: 'User' },
	_test: { type: Schema.ObjectId, ref: 'Test' },
	archived: { type: Boolean, default: false },
	answerDate: Date,
	questions: [{
		id: { type: Number, default: -1 },
		answerIsCorrect: { type: Boolean, default: false },
		choices: [{
			id: { type: Number, default: -1 },
			correct: { type: Boolean, default: false },
			selected: { type: Boolean, default: false }
		}]
	}]
});

exports.UserChoiceSchema = UserChoiceSchema;

exports.UserChoiceModel = mongoose.model("userChoice", UserChoiceSchema);