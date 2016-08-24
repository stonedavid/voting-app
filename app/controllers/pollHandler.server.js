'use strict';

var Poll = require('../models/poll.js');
var path = process.cwd();

function PollHandler () { // supports add poll, add vote, delete poll methods
    
//getPolls(req,res) takes optional queries by id and returns an array of matches
//used for 3 purposes: retrieve all polls (index), all polls by an 
//author (profile), and a specific poll (for voting or display);
    
    this.newPoll = function(req,res,body) {
        console.log("Body",body);
        var candidates = [];
        for (var property in body) {
            if (body.hasOwnProperty(property) && property !== "2" && body[property] !== "") {
                candidates.push({
                    candidate: body[property]
                    , votes: 0
                    });
                }
            }
        
        console.log("candidates",candidates);
        
        var poll = new Poll({
                author: req.user
                , question: body[2]
                , candidates: candidates});
                
        poll.save(function(err) {
            if (err) throw err;
            console.log("Saved new poll:", body.question);
        });
        
        res.redirect("/");
    };
    
    this.getPolls = function(req,res) {
    	console.log("gettin polls");
    	var query = {};
    	if (req.query.id) {
    	    query._id = req.query.id;
    	}
    	if (req.query.question) {
    	    query.question = new RegExp(req.query.question,"i");
    	}
    	if (req.query.profile) {
    	    query["author._id"] = req.user._id;
    	}
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