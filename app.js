const saveScheduleByGroup = require('./services/scheduleParser');
const saveGroups = require('./services/groupParser');
const api = require("./api/v1");

const Group = require("./models/Group");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
require('./services/mongoose')
const {migrateSchedule} = require("./services/firebaseMigrator");
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

api(app)

const hostname = '0.0.0.0';
const port = 4000;

const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// migrateSchedule()

async function parseGroups() {
  await saveGroups();
}

async function parseSchedule() {
  const groups = await Group.find({})
  let index = 0
  const interval = setInterval(async () => {
    const groupName = groups[index].name;
    console.log(` --- ${groupName} --- STARTED ${index}`)
    try {
      await saveScheduleByGroup(groups[index])
    } catch (e) {
      clearInterval(interval);
    }
    console.log(` --- ${groupName} --- FINISHED`)
    index++;
  }, 30000);
}

parseGroups()
  .then(
    () => parseSchedule()
      .then(() => console.log('START'))
      .catch(err => console.log('ERROR!!!!!', err))
  )

module.exports = app
