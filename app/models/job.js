var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var JobSchema   = new Schema({
  status: { type: String, required: true, index: { unique: true }},
});


module.exports = mongoose.model('Job', JobSchema);