'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');
var User = require('../models/users');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			var user = new User({guest: true });
			console.log(user);
    		user.save();
    		req.logIn(user, next);
		}
	}

	var clickHandler = new ClickHandler();
	var pollHandler = new PollHandler();

	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/index')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});
		
	app.route('/guest-login')
		.get(isLoggedIn, function(req,res) {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/local-login')
		.get(function (req, res) {
			res.sendFile(path + '/public/local-login.html');
		})
		.post(
			passport.authenticate("local-login", {
				successRedirect : '/index', // redirect to the secure profile section
        		failureRedirect : "/local-login-error", // redirect back to the signup page if there is an error
        		failureFlash : true // allow flash messages
		}));
		
	app.route('/local-signup')
		.get(function (req, res) {
			res.sendFile(path + '/public/local-signup.html');
		})
		.post(
			passport.authenticate("local-signup", {
        	successRedirect : '/index', // redirect to mainpage
        	failureRedirect : '/local-signup-error', // redirect back to the signup page if there is an error
        	failureFlash : true // allow flash messages*/
    	}));
    	
    app.route("/local-login-error")
    	.get(function(req,res) {
    		res.sendFile(path + '/public/local-login-error.html');
    	});

	app.route("/local-signup-error")
    	.get(function(req,res) {
    		res.sendFile(path + '/public/local-signup-error.html');
    	});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/index',
			failureRedirect: '/login'
		}));
		
	app.route('/api/:id/polls')
		.get(function(req,res) {
			pollHandler.getPolls(req,res);
		})
		.post(isLoggedIn, function(req,res) {
			pollHandler.newPoll(req,res,req.body);
		})
		.delete(isLoggedIn, function(req,res) {
			console.log("deleting",req.query.id);
			pollHandler.delete(req,res);
		});
		
	app.route('/api/:id/vote')
		.post(isLoggedIn, pollHandler.vote);
};
