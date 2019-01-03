const mongoose = require('mongoose');

module.exports = function(){
    mongoose
  .connect(
    "mongodb://localhost/mean",{ useNewUrlParser: true, useCreateIndex:true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });
}