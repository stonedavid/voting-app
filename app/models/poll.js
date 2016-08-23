'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    author: String, // ObjectId.toString() of creator
    question: String,
	candidates: Array
});

module.exports = mongoose.model('Poll', Poll);
