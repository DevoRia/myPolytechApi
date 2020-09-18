const DomParser = require('dom-parser');
const axios = require('axios');
const fs = require('fs');

const Group = require("../../models/Group");


var parser = new DomParser();

const saveGroups = async () => {
  const {data} = await axios.get(`https://rozklad.ztu.edu.ua`)
  const faculties = getClassElem('row auto-clear', data);
  for (let i = 0; i < faculties.length; i++) {
    const classElemElement = faculties[i];
    const facultyTitleRaw = getClassElem('col l12 s12', classElemElement.innerHTML);
    const facultyTitle = facultyTitleRaw[0].innerHTML.replace('<h4 style="color: rgba(21,42,111,0.95);">', '').replace('</h4>', '').trim();

    const courses = getClassElem('col l2 s6 m4', classElemElement.innerHTML);

    for (let j = 0; j < courses.length; j++) {
      const course = courses[j];
      const courseTitle = getTagElem('h5', course.innerHTML)[0]
        .innerHTML
        .replace('<h5 class="blue-text">', '')
        .replace('</h5>', '')
        .trim();

      const courseNumber = getCourseNumber(courseTitle);

      const groups = course.innerHTML.match(/<a class="collection-item" href="(.*?)">(.*?)<\/a>/g)
        .map(group => group.replace(/<a class="collection-item" href="(.*?)">/g, '').replace('</a>',''));

      for (let k = 0; k < groups.length; k++) {
        await new Group({
          name: groups[k],
          faculty: facultyTitle,
          course: courseNumber,
          courseTitle: courseTitle
        }).save()
      }
    }

  }
  return await Group.find({});
}

module.exports = saveGroups;

function getCourseNumber(courseTitle) {
  const number = parseInt(courseTitle);
  if (isNaN(number)) {
    switch (courseTitle) {
      case 'Магістри 1 курс' : return 5
      case 'Магістри 2 курс' : return 6
    }
  }
  return number;
}

function getTagElem(name, raw) {
  const fromString = parser.parseFromString(raw);
  return fromString.getElementsByTagName(name);
}

function getClassElem(name, raw) {
  const fromString = parser.parseFromString(raw);
  return fromString.getElementsByClassName(name);
}