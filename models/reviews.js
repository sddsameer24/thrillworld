var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
	review:{
		type: String,
		required: false
	},
	user:{
		type: String,
		required: false
	},
	productid: {
		type: String,
		required: false
	},
	rating: {
		type: Number,
		required: false
	},
});
module.exports = mongoose.model('review', schema);
