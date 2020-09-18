const Group = require("../../models/Group");
const DaySchedule = require("../../models/DaySchedule");
const DaySubject = require("../../models/DaySubject");

const getScheduleByGroup = async (name) => {
  try {
    const groupId = (await Group.findOne({name}))._id;
    const scheduleRaw = await DaySchedule.find({ group: groupId }).select('day dayNumber firstLesson secondLesson thirdLesson forthLesson fifthLesson sixthLesson')
    const week1 = (await Promise.all((await scheduleRaw.filter(day => day.day.endsWith('1'))).map(populateLessons))).sort((a, b) => a.index > b.index)
    const week2 = (await Promise.all(await (await scheduleRaw.filter(day => day.day.endsWith('2'))).map(populateLessons))).sort((a, b) => a.index > b.index)
    return [ ...week1, ...week2]
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = getScheduleByGroup;

async function populateLessons(day) {
  const firstLesson = await Promise.all(day.firstLesson.map(mapSubject))
  const secondLesson = await Promise.all(day.secondLesson.map(mapSubject))
  const thirdLesson = await Promise.all(day.thirdLesson.map(mapSubject))
  const forthLesson = await Promise.all(day.forthLesson.map(mapSubject))
  const fifthLesson = await Promise.all(day.fifthLesson.map(mapSubject))
  const sixthLesson = await Promise.all(day.sixthLesson.map(mapSubject))

  const assign = {title: day.day, index: day.dayNumber, firstLesson, secondLesson, thirdLesson, forthLesson, fifthLesson, sixthLesson};
  return assign;
}

const mapSubject = async(subject) =>
  DaySubject.findById(subject).populate({path: 'subject teacher room', select: 'name'})
    .map(sub => ({
      name: sub.subject.name,
      teacher: sub.teacher.name,
      room: sub.room.name,
      type: sub.type,
      subgroup: sub.subgroup,
    }))


