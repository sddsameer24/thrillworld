var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
	price: {
		type: Number,
		required: false
	},
	adult: {
		type: Number,
		required: false
	},

	children: {
		type: Number,
		required: false
	},
	id: {
		type: String,
		required: false
	},
	kids: {
		type: Number,
		required: false
	},
	arrival: {
		type: Date,
		required: false
	},
	user_id: {
		type: String,
		required: false
	},
	departure: {
		type: Date,
		required: false
	},
	totalprice: {
		type: Number,
		required: false
	},

});
module.exports = mongoose.model('cart',schema);