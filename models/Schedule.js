const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
  week1: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySchedule'
  },
  week2: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySchedule'
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
