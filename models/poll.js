var mongoose = require('mongoose');

// Subdocument schema for votes
var voteSchema = new mongoose.Schema({ ip: 'String' });

//Subdocument schema for poll choices
var choiceObject = {
		id: Number,
		text: String
};


//Subdocument schema for poll questions
var questionObject = {
	id: Number,
	text: String,
	choices: [choiceObject],
	correctChoice: Number
};

// Document schema for polls
exports.PollSchema = new mongoose.Schema({
	name: String,
	questions: [questionObject],
	isTest: Boolean
});
