'use strict';

var bcrypt = require("bcrypt-nodejs");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    guest: Boolean,
    local: {
        email: String,
        password: String
    },
	github: {
		id: String,
		displayName: String,
		username: String,
      publicRepos: Number
	},
	polls: Array
});

User.methods.generateHash = function(password) {
    console.log("generating Hash");
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);
