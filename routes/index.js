var config = require('config.json');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var db;
db = mongoose.createConnection(config.dbServer, config.dbName);

// Get Test model
var Test = db.model('Test', require('../models/test.model.js').TestModel);

// Main application view
exports.index = function(req, res) {
	res.render('index');
};

// JSON API for list of tests
exports.list = function(req, res) {
	// Query Mongo for tests, get only test names
	Test.find({}, 'name', function(error, tests) {
		res.json(tests);
	});
};

// JSON API for getting a single test
exports.test = function(req, res) {
	// Test ID comes in the URL
	var testId = req.params.id;
	
	// convert to plain object from Mongo document
	var testOptions = {
			lean: true
	};
	
	// projection - hide certain field with correct answers
	var queryFilter = {
			"questions.correctChoice": false
	};
	// Find the test by its ID
	Test.findById(testId, queryFilter, testOptions, function(err, test) {
		// TODO: Check weather user already tried this test
		// if yes, show them their result (calculate it)
		if (test) { 
			res.json(test); 
		} else {
			res.json({error: true});
		}
	});
};

// JSON API for creating a new test
exports.create = function(req, res) {
	var reqBody = req.body;
			// Filter out choices with empty text
			//choices = reqBody.choices.filter(function(v) { return v.text != ''; }),
			// Build up test object to save
	var testObj = {
			name: reqBody.name, 
			questions: reqBody.questions, 
			author: reqBody.user
	};

	// Create test model from built up test object
	var test = new Test(testObj);
	
	// Save test to DB
	test.save(function(err, doc) {
		if(err || !doc) {
			throw 'Error';
		} else {
			res.json(doc);
		}		
	});
};

// submit answers
exports.answer = function(req, res) {
	var user = jwt.decode(req.session.token);
	console.log("user is answering:");
	console.log(user);
};

exports.vote = function(socket) {
	socket.on('send:vote', function(data) {
		var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
		
		Test.findById(data.test_id, function(err, test) {
			var choice = test.choices.id(data.choice);
			choice.votes.push({ ip: ip });
			
			test.save(function(err, doc) {
				var theDoc = { 
					question: doc.question, _id: doc._id, choices: doc.choices, 
					userVoted: false, totalVotes: 0 
				};

				// Loop through test choices to determine if user has voted
				// on this test, and if so, what they selected
				for(var i = 0, ln = doc.choices.length; i < ln; i++) {
					var choice = doc.choices[i]; 

					for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
						var vote = choice.votes[j];
						theDoc.totalVotes++;
						theDoc.ip = ip;

						if(vote.ip === ip) {
							theDoc.userVoted = true;
							theDoc.userChoice = { _id: choice._id, text: choice.text };
						}
					}
				}
				
				socket.emit('myvote', theDoc);
				socket.broadcast.emit('vote', theDoc);
			});			
		});
	});
};