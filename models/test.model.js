var mongoose = require('mongoose');

//Subdocument schema for poll choices
var choiceObject = {
		id: Number,
		text: String,
		correct: Boolean
};


//Subdocument schema for poll questions
var questionObject = {
	id: Number,
	text: String,
	choices: [choiceObject],
	multipleChoices: Boolean
};

// Document schema for polls
//exports.PollSchema = new mongoose.Schema({
var TestSchema = new mongoose.Schema({
		name: String,
		questions: [questionObject],
		_author: { type: mongoose.Schema.ObjectId, ref: 'User' },
		creationDate: { type: Date, default: Date.now },
		lastEditDate: { type: Date, default: Date.now }
});

exports.TestModel = mongoose.model('Test', TestSchema);
