const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dayScheduleSchema = new Schema({
  day: {
    type: String
  },
  dayNumber: {
    type: Number
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  firstLesson: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySubject'
  },
  secondLesson: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySubject'
  },
  thirdLesson: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySubject'
  },
  forthLesson: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySubject'
  },
  fifthLesson: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySubject'
  },
  sixthLesson: {
    type: [Schema.Types.ObjectId],
    ref: 'DaySubject'
  },
});

module.exports = mongoose.model('DaySchedule', dayScheduleSchema);