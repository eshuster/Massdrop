var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
// var bcrypt     = require('bcrypt-nodejs');

// user schema
var JobSchema   = new Schema({
  // name: String,
  status: { type: String, required: true, index: { unique: true }},
});


module.exports = mongoose.model('Job', JobSchema);