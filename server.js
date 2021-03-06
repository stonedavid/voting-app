'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require("cookie-parser");
var session = require('express-session');
var flash = require('connect-flash');
var bodyParser = require("body-parser");

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);



app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));


app.use(cookieParser('secretClementine'));
app.use(session({
	secret: 'secretClementine',
	cookie: {maxAge: 3600000, httpOnly: false},
	resave: false,
	saveUninitialized: true
}));

app.use(flash());



app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});