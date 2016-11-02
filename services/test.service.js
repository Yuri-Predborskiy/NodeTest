/* The express user service encapsulates all data access 
 * for users behind a simple interface. 
 * It exposes methods for CRUD operations and user authentication.*/

var config = require('config.json');
var _ = require('lodash');
var extend = require('util')._extend;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongoose = require('mongoose');
var db = mongoose.createConnection(config.dbServer, config.dbName);
var Users = db.model('User', require('../models/user.model.js').UserModel);
var Test = db.model('Test', require('../models/test.model.js').TestSchema);
var UserChoice = db.model('userChoices', require('../models/userChoice.schema.js').UserChoiceSchema);

var service = {};

// helper function to determine weather user is admin
function userIsAdmin(_user) {
	var deferred = Q.defer();
	Users.findById(_user, function (err, user) {
		if (err || !user || !user.admin) {
			deferred.reject();
		} else if (user.admin) {
			deferred.resolve();
		}
	});
	return deferred.promise;
}

// function for getting a list of tests
function getAll() {
	var deferred = Q.defer();
	// find all documents in "tests" and return 'name' field and id
	Test.find({}, 'name', function(err, tests) {
		if (err) { 
			deferred.reject(err); 
		}
		if (tests) {
			deferred.resolve(tests);
		} else {
			deferred.resolve({err: "test not found"});
		}
	});
	return deferred.promise;
}

// function for getting a single test
function getTest(_user, _test) {
	var deferred = Q.defer();
	// check if user has any results for this test
	UserChoice.find({ '_user': _user, '_test': _test, 'archived': 'false' })
	.exec(function (err, userChoices) {
		if (err) {
			// on error write error and stop execution
			console.log("error finding result for user " + _user + " test ID " + _test);
			console.error(err);
			deferred.reject(err);
		} else {
			if(userChoices.length > 0) {
				// there are test results - write error and stop execution
				var reply = {
					error: true,
					errorCode: 307,
					message: "Пользователь уже проходил данный тест. Для повторного тестирования сделайте результат архивным."
				};
				deferred.resolve(reply);
			} else {
				Test.findById(_test, function(err, found) {
					if (err) { deferred.reject(err); }
					if (found) {
						deferred.resolve(found);
					} else {
						deferred.resolve();
					}
				});
			}
		}
	});
	return deferred.promise;
}

// get test details for editing
function getTestForEditing(_user, _test) {
	var deferred = Q.defer();
	Test.findById(_test)
	.populate('_author', 'firstName lastName middleName')
	.exec(function(err, test) {
		if (err) { deferred.reject(err); }
		if (test) {
			console.log(test);
			if(test._author._id === _user) {
				deferred.resolve(test);
			} else {
				userIsAdmin(_user)
				.then(function() {
					deferred.resolve(test);
				})
				.catch(function() {
					deferred.resolve({ error: true, errorCode: 401 });
				});
			}
		}
	});
	return deferred.promise;
}

function editTest(_test, data, user) {
	var deferred = Q.defer();
	
	var testObj = JSON.parse(data);
	testObj._author = user;
	if(_test && _test !== 'new') {
		// find test by ID and update contents
		Test.findById(_test, function (err, item) {
			if (err) {
				console.log("error reading test id " + _test + " err: " + err);
				deferred.reject(err);
			} else {
				item.name = testObj.name;
				item.questions = testObj.questions;
				// last edit date will be updated with current server time
				item.lastEditDate = Date.now();
				// save updated test to DB
				item.save(function (err, item) {
					if (err) {
						console.error(err);
						deferred.reject(err);
					}
					deferred.resolve();
				});
			}
		});
	} else {
		// create a new DB object
		console.log(testObj);
		var item = new Test({
			name: testObj.name,
			questions: testObj.questions,
			_author: testObj._author
		});
		item.save(function (err) {
			if (err) {
				console.error(err);
				deferred.reject(err);
			}
			deferred.resolve();
		});
	}
	return deferred.promise;
}

// get weather choice ID in question ID is correct
function getChoiceIsCorrectById(test, qId, cId) {
	var qs = test.questions;
	for(var i = 0; i < qs.length; i++) {
		// find question by ID
		if(qs[i].id !== qId) {
			continue;
		}
		var cs = qs[i].choices;
		for(var j = 0; j < cs.length; j++) {
			// find choice by ID
			if(cs[j].id !== cId) {
				continue;
			}
			return cs[j].correct;
		}
	}
}

function processUserChoices(uc, _test, _user, originalTest) {
	uc._test = _test;
	uc._user = _user;
	uc.answerDate = Date.now();
	delete uc._id;
	var qs = uc.questions;
	for(var qi = 0; qi < qs.length; qi++) {
		var cs = qs[qi].choices;
		var correctChoices = 0; // per question
		for(var ci = 0; ci < cs.length; ci++) {
			cs[ci].correct = getChoiceIsCorrectById(originalTest, qs[qi].id, cs[ci].id);
			if ( (cs[ci].correct && cs[ci].selected) || (!cs[ci].correct && !cs[ci].selected) ) {
				correctChoices++;
			}
		}
		if (correctChoices === cs.length) {
			qs[qi].answerIsCorrect = true;
		}
		correctChoices = 0;
	}
	return uc;
}

function saveResults(_test, choices, _user) {
	// add required fields and save user choices to db
	var deferred = Q.defer();
	Test.findOne({ '_id': _test }, function(err, originalTest) {
		if (err) {
			console.log("error finding test " + _test);
			console.error(err);
			deferred.reject(err);
		}
		if (originalTest) {
			// correct choices found
			var results = processUserChoices(JSON.parse(choices), _test, _user, originalTest);
			var ans = new UserChoice(results);
			ans.save(function (err) {
				if(err) {
					console.log("error saving test results");
					console.error(err);
					deferred.reject(err);
				}
				deferred.resolve();
			});
		}
	});
	return deferred.promise;
}

// get results for each separate user choice array item
function getResults(detailed, choices) {
	var correctAnswers = 0;
	for(var i = 0; i < choices.questions.length; i++) {
		if(choices.questions[i].answerIsCorrect) {
			correctAnswers++;
		}
	}
	// basic info
	var info = {
		testName: choices._test.name,
		answerDate: choices.answerDate.toLocaleString(),
		correctAnswers: correctAnswers,
		questionsTotal: choices.questions.length
	};
	if(!detailed) {
		return info;
	} else {
		info.details = choices;
		return info;
	}
}

function getOneResult(_test, _user) {
	// find one result where user ID = _user, test ID = _test
	var deferred = Q.defer();
	// find user choices
	UserChoice.find({ '_user': _user, '_test': _test })
	.populate('_test', 'name')
	.sort({ answerDate: -1 })
	.exec(function (err, userChoices) {
		if (err) {
			console.log("error finding result for user " + _user + " test ID " + _test);
			console.error(err);
			deferred.reject(err);
		}
		var results = {};
		if (userChoices.length === 0) {
			console.log("results for user " + _user + " not found");
			deferred.resolve({ error: "noResults", testId: _test });
		} else {
			results = getResults(false, userChoices[0]);
			deferred.resolve(results);
		}
	});
	return deferred.promise;
}

function getAllResults(_test, choices, _user) {
	var deferred = Q.defer();
	console.log("getting all test results for test " + _test);
	Test.findById(_test, function(err, testDetails) {
		if (err)  {
			console.log("error finding test by ID " + _test);
			console.error(err);
			deferred.reject(err);
		} else {
			UserChoice.find({ '_test': _test })
			.populate('_user', 'firstName lastName middleName branch position')
			.sort({ answerDate: 'desc' })
			.exec(function (err, userChoices) {
				if (err) {
					console.log("error finding all results for test ID " + _test);
					console.error(err);
					deferred.reject(err);
				}
				// query completed without errors
				var results = [];
				if (userChoices.length === 0) {
					// no test results found
					deferred.resolve({ error: "noResults", testDetails: testDetails });
				} else {
					for (var i = 0; i < userChoices.length; i++) {
						results.push(getResults(true, userChoices[i]));
					}
					deferred.resolve({ testResults: results, testDetails: testDetails });
				}
			});
		}
	});
	return deferred.promise;
}

function authorizeResultChange(_user, resultId) {
	var deferred = Q.defer();
	userIsAdmin(_user).then(function () {
		deferred.resolve();
	})
	.catch(function (err) {
		// user is not admin
		UserChoice.findOne({ _id: resultId })
		.populate('_test', '_author')
		.exec(function (err, userChoice) {
			if (err) {
				// test not found
				deferred.reject();
			}
			if (userChoice._test._author === _user) {
				// user is author of the test - authorize
				deferred.resolve();
			} else {
				// user is neither admin, nor test author
				deferred.reject();
			}
		});
	});
	return deferred.promise;
}

function setArchiveFlagOnResults(resultIds, _user, newValue) {
	var deferred = Q.defer();
	var results = JSON.parse(resultIds);
	authorizeResultChange(_user, results[0])
	.then(function() {
		var query = { _id: { $in: results.map(mongoose.Types.ObjectId) } };
		UserChoice.update(query, { archived: newValue }, { multi: true }, function(err, data) {
			if(err) {
				console.log("error setting archive flag to " + newValue + " on results: " + err);
				deferred.reject(err);
			}
			deferred.resolve();
		});
	})
	.catch(function (err) {
		deferred.resolve({ errorCode: 401 });
	});
	return deferred.promise;
}

function deleteResults(resultIds, _user) {
	var deferred = Q.defer();
	var results = JSON.parse(resultIds);
	authorizeResultChange(_user, results[0])
	.then(function() {
		var query = { _id: { $in: results.map(mongoose.Types.ObjectId) } };
		UserChoice.find(query).remove(function(err, result) {
			if (err) {
				console.log("error deleting records");
				deferred.reject(err);
			}
			deferred.resolve();
		});
	})
	.catch(function (err) {
		deferred.resolve({ errorCode: 401 });
	});
	return deferred.promise;
}

// test services
service.getAll = getAll;
service.getTest = getTest;
service.getTestForEditing = getTestForEditing;
service.editTest = editTest;
service.saveResults = saveResults;
service.getOneResult = getOneResult;
service.getAllResults = getAllResults;
service.setArchiveFlagOnResults = setArchiveFlagOnResults;
service.deleteResults = deleteResults;

module.exports = service;
