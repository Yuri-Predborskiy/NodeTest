/* The express users api controller defines the routes responsible 
 * for user related operations such as authentication, registration, 
 * retrieving, updating and deleting user data.*/

// define dependencies
var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

// define functions
function authenticateUser(req, res) {
	userService.authenticate(req.body.username, req.body.password)
	.then(function (token) {
		if(token) {
			// authentication successful
			res.send({ token: token });
		} else {
			// authentication failed
			res.sendStatus(401);
		}
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function registerUser(req, res) {
	userService.create(req.body)
	.then(function () {
		res.sendStatus(200);
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function getCurrentUser(req, res) {
	userService.getById(req.user.sub)
	.then(function (user) {
		if (user) {
			res.send(user);
		} else {
			res.sendStatus(404);
		}
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function getUserById(req, res) {
	console.log("getting user by ID, id is");
	console.log(req.params._id);
	userService.getById(req.query.userId)
	.then(function (user) {
		if (user) {
			res.send({name: user.firstName + " " + user.lastName});
		} else {
			res.sendStatus(404);
		}
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function getAllUsers(req, res) {
	userService.getAll(req.user.sub)
	.then(function (data) {
		if(data.error) {
			res.send({ error: true, errorDetails: data });
		} else {
			res.send({ 'users': data });
		}
	})
	.catch(function (err) {
		res.status(500).send(err);
	});
}

function updateUser(req, res) {
	var userId = req.user.sub;
	if (req.params._id !== userId) {
		// can only update own account
		return res.status(401).send('You can only update your own account');
	}
	
	userService.update(userId, req.body)
	.then(function () {
		res.sendStatus(200);
	})
	.catch(function (err) {
		console.log(err);
		res.status(400).send(err);
	});
}

function deleteUser(req, res) {
	var userId = req.user.sub;
	if (req.params._id !== userId) {
		return res.status(401).send('You can only delete your own account');
	}
	
	userService.delete(userId)
	.then(function () {
		res.sendStatus(200);
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function updateAdminStatus(req, res) {
	var userId = req.user.sub;
	userService.updateAdminStatus(userId, req.body.ids, req.body.mode)
	.then(function (result) {
		if (result && result.error) {
			res.send({ error: true, errorDetails: result.errorDetails });
		} else {
			res.sendStatus(200);
		}
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function updateActiveState(req, res) {
	var userId = req.user.sub;
	userService.updateActiveState(userId, req.body.ids, req.body.mode)
	.then(function (result) {
		if (result && result.error) {
			res.send({ error: true, errorDetails: result.errorDetails });
		} else {
			res.sendStatus(200);
		}
	})
	.catch(function (err) {
		res.status(400).send(err);
	});
}

function deleteUsers(req, res) {
	var userId = req.user.sub;
}

// define routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.get('/user/:_id', getUserById);
router.get('/all', getAllUsers);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.post('/updateAdminStatus', updateAdminStatus);
router.post('/updateActiveState', updateActiveState);
router.delete('/massdelete', deleteUsers);

module.exports = router;