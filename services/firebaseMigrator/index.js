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
    pushed[i] = {
      _id: groups[i]._id,
      name: groupName,
      faculty: groups[i].faculty,
      course: groups[i].course,
      courseTitle: groups[i].courseTitle,
    }
  }
}

exports.migrateSchedule = async () => {
  const groups = await Group.find({})
  const ref = firebase.firestore(myPolytech).collection('Schedule');

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const schedule = await getScheduleByGroup(group.name)
    const documentReference = await ref.add({
      name: group.name,
      schedule
    });
  }
}

function arrayToObject(array, deep = false) {
  const object = {}
  for (let i = 0; i < array.length; i++) {
    object[i] = array[i]
  }
  return object;
}

