'use strict';

var Poll = require('../models/poll.js');
var path = process.cwd();

function PollHandler () { // supports add poll, add vote, delete poll methods
    
//getPolls(req,res) takes optional queries by id and returns an array of matches
//used for 3 purposes: retrieve all polls (index), all polls by an 
//author (profile), and a specific poll (for voting or display);
    
    this.getPolls = function(req,res) {
    	console.log("gettin polls");
    	var query = req.query.id ? { _id: req.query.id } : {};
    	Poll
    		.find( query || {} )
    		.exec(function (err, result) {
    				if (err) { 
    					console.log("error");
    					throw err; }
    				
    				console.log("Result from Mongoose",result);
    				res.json(result);
    		});
    };
    
    this.vote = function(req,res) {
        console.log("voting",req.body.candidate);
        var query = { "_id": req.query.id, "candidates.candidate": req.query.candidate };
        Poll
    		.findOneAndUpdate( query, {"$inc": { "candidates.$.votes": 1} }, function(err,result) {
    		    if (err) throw err;
    		    Poll.findOne( query, function(err,result) {
    		        if (err) throw err;
    		        res.json(result);
    		    });
    		});
    };

}

module.exports = PollHandler;