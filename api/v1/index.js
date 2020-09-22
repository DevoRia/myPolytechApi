const getScheduleByGroup = require("../../services/schedule");
const Group = require("../../models/Group");

const api = (app) => {

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

}

module.exports = api;