const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const daySubjectSchema = new Schema({
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  },
  subgrouped: {
    type: Boolean
  },
  subgroup: {
    type: Number
  },
  type: {
    type: String
  }
});

module.exports = mongoose.model('DaySubject', daySubjectSchema);