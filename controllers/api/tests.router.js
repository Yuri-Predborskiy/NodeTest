/* The express users api controller defines the routes responsible 
 * for user related operations such as authentication, registration, 
 * retrieving, updating and deleting user data.*/

// define dependencies
var config = require('config.json');
var express = require('express');
var router = express.Router();
var testService = require('services/test.service');

// tests start here
// get a list of tests (only test name and ID)
function getAll(req, res) {
	testService.getAll()
		.then(function (tests) {
			if(tests.length > 0) {
				res.send(tests);
			} else {
				res.send({error: true, message: "Нет действующих тестов."});
			}
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function getTest(req, res) {
	testService.getTest(req.user.sub, req.query.testId)
		.then(function (data) {
			if(data) {
				res.send(data);
			} else {
				res.send({error: true, message: "Тест не найден."});
			}
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function getTestForEditing(req, res) {
	testService.getTestForEditing(req.user.sub, req.query.testId)
	.then(function (data) {
		if(data) {
			res.send(data);
		} else {
			res.send({error: true, message: "Тест не найден."});
		}
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function editTest(req, res) {
	testService.editTest(req.body.testId, req.body.testData, req.user.sub)
		.then(function (response) {
			res.send({result: "success"});
		})
		.catch(function (err) {
			console.error(err);
			res.status(400).send(err);
		});
}

function saveResults(req, res) {
	testService.saveResults(req.body.testId, req.body.choices, req.user.sub)
		.then(function (response) {
			res.send({result: "success"});
		})
		.catch(function (err) {
			console.log("error");
			console.error(err);
			res.status(400).send(err);
		});
}

function getOneResult(req, res) {
	testService.getOneResult(req.query.testId, req.user.sub)
		.then(function (response) {
			res.send(response);
		})
		.catch(function (err) {
			console.log("error processing single test result, test ID: " + req.body.testId + " userID: " + req.user.sub);
			console.err(err);
			res.status(400).send(err);
		});
}

function getAllResults(req, res) {
	testService.getAllResults(req.query.testId)
		.then(function (response) {
			res.send(response);
		})
		.catch(function (err) {
			console.log("error processing all test results, test ID: " + req.body.testId);
			console.err(err);
			res.status(400).send(err);
		});
}

function setArchiveFlag(req, res) {
	testService.setArchiveFlagOnResults(req.body.resultIds, req.user.sub, req.body.mode)
		.then(function (response) {
			res.send(response);
		})
		.catch(function (err) {
			console.log("error archiving test results, ids: " + req.body.resultIds);
			console.err(err);
			res.status(400).send(err);
		});
}

function unarchiveResults(req, res) {
	testService.setArchiveFlagOnResults(req.body.resultIds, req.user.sub, false)
		.then(function (response) {
			res.send(response);
		})
		.catch(function (err) {
			console.log("error unarchiving test results, ids: " + req.body.resultIds);
			console.err(err);
			res.status(400).send(err);
		});
}

function deleteResults(req, res) {
	testService.deleteResults(req.body.resultIds, req.user.sub)
		.then(function (response) {
			res.send(response);
		})
		.catch(function (err) {
			console.log("error deleting test results, ids: " + req.body.resultIds + " error: " + err.toString());
			console.err(err);
			res.status(400).send(err);
		});
}

// define routes
router.get('/all', getAll);
router.get('/test', getTest);
router.get('/testEdit', getTestForEditing);
router.post('/edit', editTest);
router.post('/results/submit', saveResults);
router.get('/results/my', getOneResult);
router.get('/results/all', getAllResults);
router.post('/results/setArchiveFlag', setArchiveFlag);
router.post('/results/delete', deleteResults);

module.exports = router;