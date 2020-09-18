const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mypolytech', {useNewUrlParser: true});

mongoose.connection.on('error', (err) => {
  console.log(err)
  process.exit(-1)
})

module.exports = mongoose;

