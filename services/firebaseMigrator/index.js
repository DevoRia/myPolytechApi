const firebase = require('firebase');
const Group = require("../../models/Group");
const getScheduleByGroup = require("../schedule");

const myPolytech = firebase.initializeApp({ //Input your config
  apiKey: "",
  projectId: "",
  databaseURL: "",
  storageBucket: ""
}, "myPolytech");

exports.migrateGroups = async () => {
  const groups = await Group.find({})
  const ref = firebase.database(myPolytech).ref().child('Groups');
  const pushed = {}

  for (let i = 0; i < groups.length; i++) {
    const groupName = groups[i].name;
    console.log(groupName);
    pushed[i] = {
      _id: groups[i]._id,
      name: groupName,
      faculty: groups[i].faculty,
      course: groups[i].course,
      courseTitle: groups[i].courseTitle,
    }
  }

  await ref.set(pushed, () => {
    console.log('FINALLY');
  });
}

exports.migrateSchedule = async () => {
  const groups = await Group.find({})
  const ref = firebase.database(myPolytech).ref().child('Schedules');
  const allSchedules = {}

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const schedule = await getScheduleByGroup(group.name)
    let scheduleMapped = schedule.map(day => {
       day.firstLesson = arrayToObject(day.firstLesson)
       day.secondLesson = arrayToObject(day.secondLesson)
       day.thirdLesson = arrayToObject(day.thirdLesson)
       day.forthLesson = arrayToObject(day.forthLesson)
       day.fifthLesson = arrayToObject(day.fifthLesson)
       day.sixthLesson = arrayToObject(day.sixthLesson)
       return day;
     })
    allSchedules[group.name] = arrayToObject(scheduleMapped);
  }
  await ref.set(allSchedules, () => {
    console.log('FINALLY');
  });
}

function arrayToObject(array, deep = false) {
  const object = {}
  for (let i = 0; i < array.length; i++) {
    object[i] = array[i]
  }
  return object;
}

