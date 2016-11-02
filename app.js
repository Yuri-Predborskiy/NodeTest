require('rootpath')();
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var routes = require('./routes/index');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);

app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api, leave register and login unsecured
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/tests', require('./controllers/api/tests.router'));

// make '/app' default route - redirect '/' requests to '/app'
app.get('/', function (req, res) {
	return res.redirect('/app');
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});