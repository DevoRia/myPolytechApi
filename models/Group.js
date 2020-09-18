const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new mongoose.Schema({
  name: String,
  faculty: String,
  course: Number,
  courseTitle: String
});

module.exports = mongoose.model('Group', groupSchema);