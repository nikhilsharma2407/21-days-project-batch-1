const mongoose = require("mongoose");
const { Schema } = mongoose;

// {
//     title: "JavaScript Fundamentals",
//     description: "Learn the basics of JavaScript including variables, loops, functions, and ES6 features.",
//     price: 3000
//   },

const courseSchema = new Schema({
  title: String,
  description: String,
  price: Number,
});

// CRUD

courseSchema.statics.createCourse = async (data) => {
  return await CourseModel.create(data);
};

courseSchema.statics.updateCourse = async (id, data) => {
  return await CourseModel.findByIdAndUpdate(id, data, { new: true });
};

courseSchema.statics.deleteCourse = async (id) => {
  return await CourseModel.findByIdAndDelete(id, { new: true });
};

courseSchema.statics.getAll = async (id) => {
    return await CourseModel.find();
};

const CourseModel = mongoose.model("Course", courseSchema);

module.exports = CourseModel;
