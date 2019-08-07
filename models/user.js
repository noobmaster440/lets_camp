const mongoose = require(`mongoose`);
const passportLocalMongose = require(`passport-local-mongoose`);
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
userSchema.plugin(passportLocalMongose);
module.exports = mongoose.model(`User`, userSchema);
