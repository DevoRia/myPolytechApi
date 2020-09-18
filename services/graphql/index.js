const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const Group = require("../../models/Group");
const getScheduleByGroup = require("../schedule");

const graphql = async (app) => {
  const schema = buildSchema(`
  type Query {
    getGroupByName(name: String): Group
    getScheduleByGroup(name: String): Schedule
  }

  type Group {
    _id: ID!
    name: String
    faculty: String
    course: Int
  }
  
  type Schedule {
     week1: [Day!]!
     week2: [Day!]!
  }
  
  
  type Day {
    title: String!
    index: Int!
    firstLesson: [Subject!]!
    secondLesson: [Subject!]!
    thirdLesson: [Subject!]!
    forthLesson: [Subject!]!
    fifthLesson: [Subject!]!
    sixthLesson: [Subject!]!
  }
  
  type Subject {
    name: String
    room: String
    type: String
    teacher: String
    subgroup: Int
  }
  
  
`);

  const root = {
    getGroupByName: async ({name}) => Group.findOne({name}),
    getScheduleByGroup: async ({name}) => getScheduleByGroup(name)
  };

  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }));
}

module.exports = graphql;
