'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    author: Object,
    question: String,
	candidates: Array
});

module.exports = mongoose.model('Poll', Poll);
