const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Teacher', teacherSchema);