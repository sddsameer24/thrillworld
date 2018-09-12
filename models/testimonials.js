var mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
var random = require('mongoose-simple-random');

var Schema = mongoose.Schema;

var schema = new Schema({
	Name: {
		type: String,
		required: false
	},
	comment: {
		onHand: Number,
		disableAtZero: Boolean
    },
    imagePath: {
		type: String,
		required: false
    },
})
