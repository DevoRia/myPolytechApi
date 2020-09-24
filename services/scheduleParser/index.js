const Subject = require("../../models/Subject");
const Teacher = require("../../models/Teacher");
const Room = require("../../models/Room");
const DaySubject = require("../../models/DaySubject");
const DaySchedule = require("../../models/DaySchedule");

const DomParser = require('dom-parser');
const axios = require('axios');
const fs = require('fs');

const days = ['Понеділок','Вівторок','Середа','Четвер',"П'ятниця",'Субота','Неділя']
var parser = new DomParser();

const saveScheduleByGroup = async (group) => {
  const {data} = await axios.get(`https://rozklad.ztu.edu.ua/schedule/group/${encodeURIComponent(group.name)}`)
  console.log(` --- ${group.name} --- PROCESSING...`)
  const table = getTagElem('table', data);
  for (let i = 0; i < table.length; i++) { // Schedule
    const tr = getTagElem('tr', table[i].innerHTML);
    for (let j = 0; j < tr.length; j++) { //daySchedule
      const td = getTagElem('td', tr[j].innerHTML);
      for (let k = 0; k < td.length; k++) {//daySubjects
        if (!!td[k]) {
          const replaced = td[k].innerHTML
            .trim()
            .replace(new RegExp('</div>$'), '')
            .replace('<div class="variative">', '')
            .trim();
          const subgroups = replaced.match('<div class="subgroups">');
          if (subgroups) {
            const ones = getClassElem('one', replaced);
            ones.map(async (one, i) => await saveDaySubject(group._id, one.outerHTML, td[k],i+1 ))
          } else {
            await saveDaySubject(group._id, replaced, td[k])
          }
        }
      }
    }
  }
}

module.exports = saveScheduleByGroup;

async function saveDaySubject(groupId, raw, courseData, subgroup = null) {
  const subject = await getSubjects(raw)
  const teacher = await getTeachers(raw)
  const room = await getRoom(raw)

  if (subject && teacher && room) {
    const daySubject = await createDaySubject(subject, teacher, room, raw, subgroup);
    const dataSchedule = await getDataAndDay(daySubject, groupId, courseData, subgroup)
  }
}

async function getSubjects(replaced) {
  let subject = replaced.match(/<div class="subject">(.*?)<\/div>/g);
  if(!!subject){
    subject = subject.map((val) => val.replace(/<\/div>/g,'').replace('<div class="subject">', ''))
    const subjects = await Subject.find({name: subject[0]});
    if (subjects.length === 0) {
      return await new Subject({name: subject[0]}).save()
    } else {
      return subjects[0]
    }
  }
  return null;
}

async function getTeachers(replaced) {
  let teacher = replaced.match(/<div class="teacher">(.*?)<\/div>/g);
  if(!!teacher){
    teacher = teacher.map((val) => val.replace(/<\/div>/g,'').replace('<div class="teacher">', ''))
    const foundTeachers = await Teacher.find({name: teacher[0]});
    if (foundTeachers.length === 0) {
      return await new Teacher({name: teacher[0]}).save()
    } else {
      return foundTeachers[0]
    }
  }
  return null;
}

async function getRoom(replaced) {
  let room = replaced.toString().match(/(.*?)<\/span>/g);
  if(!!room){
    room = room.map((val) => val
      .replace(/<\/span>/g,'')
      .replace('<span class="room ">', '')
      .replace('<span class="room  changed ">', '')
      .trim())
    const foundTeachers = await Room.find({name: room[0]});
    if (foundTeachers.length === 0) {
      return await new Room({name: room[0]}).save()
    } else {
      return foundTeachers[0]
    }
  }
  return null;
}

async function createDaySubject(subject, teacher, room, raw, subgroup = null) {
  let subgrouped = false

  if (subgroup) {
    subgrouped = true
  }

  let type = raw.match(/<div>(.*?),ауд/g);
  type = type[0].replace('<div>', '').replace(',ауд', '')
  const daySubjects = await DaySubject.find({type, subject: subject._id, teacher: teacher._id, room: room._id, subgrouped, subgroup});
  if (daySubjects.length === 0) {
    return await new DaySubject({type, subject: subject._id, teacher: teacher._id, room: room._id, subgrouped, subgroup}).save()
  } else {
    return daySubjects[0]
  }
}

async function getDataAndDay(daySubject, group, raw, subgroup = null) {
  const dayOfSubject = raw.outerHTML.match(/day="(.*?)"/g);
  const hourOfSubject = raw.outerHTML.match(/hour="(.*?)"/g);

  const hour = hourOfSubject[hourOfSubject.length - 1].replace('hour="', '').replace('"', '');
  const day = dayOfSubject[dayOfSubject.length - 1].replace('day="', '').replace('"', '').replace('&#39;', "'");
  const conditions = {day, group};
  let dayScheduleDocument = await DaySchedule.findOne(conditions)

  if (!dayScheduleDocument) dayScheduleDocument = Object.assign({dayNumber: getDayNumber(day)}, conditions)

  switch (hour) {
    case'8:30-9:50': dayScheduleDocument.firstLesson ? dayScheduleDocument.firstLesson.push(daySubject._id) : dayScheduleDocument.firstLesson = [daySubject._id]; break;
    case'10:00-11:20': dayScheduleDocument.secondLesson ? dayScheduleDocument.secondLesson.push(daySubject._id) : dayScheduleDocument.secondLesson = [daySubject._id]; break;
    case'11:40-13:00': dayScheduleDocument.thirdLesson ? dayScheduleDocument.thirdLesson.push(daySubject._id) : dayScheduleDocument.thirdLesson = [daySubject._id]; break;
    case'13:30-14:50': dayScheduleDocument.forthLesson ? dayScheduleDocument.forthLesson.push(daySubject._id) :  dayScheduleDocument.forthLesson = [daySubject._id]; break;
    case'15:00-16:20': dayScheduleDocument.fifthLesson ? dayScheduleDocument.fifthLesson.push(daySubject._id) : dayScheduleDocument.fifthLesson = [daySubject._id]; break;
    case'16:30-17:50': dayScheduleDocument.sixthLesson ? dayScheduleDocument.sixthLesson.push(daySubject._id) : dayScheduleDocument.sixthLesson = [daySubject._id]; break;
  }

  return DaySchedule.findOneAndUpdate(conditions, dayScheduleDocument, {upsert: true});
}

function getDayNumber(day) {
  for (let i = 0; i < days.length; i++) {
    if (day.startsWith(days[i])) {
      return i + 1
    }
  }
}

function getTagElem(name, raw) {
  const fromString = parser.parseFromString(raw);
  return fromString.getElementsByTagName(name);
}

function getClassElem(name, raw) {
  const fromString = parser.parseFromString(raw);
  return fromString.getElementsByClassName(name);
}
