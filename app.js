const saveScheduleByGroup = require('./services/scheduleParser');
const saveGroups = require("./services/groupParser");

const graphql = require("./services/graphql");

const Group = require("./models/Group");

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const axios = require('axios');
const fs = require('fs');
require('./services/mongoose')
const getScheduleByGroup = require("./services/schedule");
const app = express();

const days = ['Понеділок','Вівторок','Середа','Четвер',"П'ятниця",'Субота','Неділя']
const hours = ['8:30-9:50','10:00-11:20','11:40-13:00','13:30-14:50','15:00-16:20','16:30-17:50']

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

graphql(app)

app.get('/parseSchedules', async (req, res) => {
  res.json({status: 'started'})
})
app.get('/parseGroups', async (req, res) => {
  const groups = await saveGroups();
  res.json(groups);
})

app.get('/group', async (req, res) => {
  const group = await Group.find({});
  res.json({list: group})
})

app.get('/schedule', async (req, res) => {
  try {
    const group = req.query.group;
    const schedule = await getScheduleByGroup(group)
    res.json({schedule})
  } catch (e) {
    res.status(500).json({error: e.message})
  }

})

const hostname = '0.0.0.0';
const port = 4001;

const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);

});

async function parse() {
  const groups = await Group.find({})
  let index = 58
  const interval = setInterval(async () => {
    const groupName = groups[index].name;
    console.log(` --- ${groupName} --- STARTED`)
    await saveScheduleByGroup(groups[index])
    console.log(` --- ${groupName} --- FINISHED`)
    index++;
  }, 30000);
}

//
// parse()
//   .then(() => console.log('START'))
//   .catch(err => console.log('ERROR!!!!!', err))

module.exports = app
