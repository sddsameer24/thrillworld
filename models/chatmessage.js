var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	to : String,
	form : String,
	message : String
});

module.exports = mongoose.model('Message',schema);