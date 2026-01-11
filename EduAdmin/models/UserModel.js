const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
  secret: String, 
});

userSchema.statics.findUser = async (username) => {
  const userData = (await UserModel.findOne({ username }))?.toObject();
  return userData;
};

userSchema.statics.createUser = async (userdata) => {
  const userData = await UserModel.create(userdata);
  return userData;
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
