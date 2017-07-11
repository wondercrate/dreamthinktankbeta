var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var goalSchema = new Schema({
	content         : {type: String, required: true},
	timeStamp       : {type: Date},
	rating          : {type: Number},
	usersRated      : {type: Number},
	userSubmitted   : {type: Schema.Types.ObjectId, ref: 'user'},
	image           : {type: String},
	userId          : {type: String},
	public          : {type: Boolean},
	accomplished    : {type: Boolean}
});

var Goal = mongoose.model('goal', goalSchema);
module.exports = Goal; 