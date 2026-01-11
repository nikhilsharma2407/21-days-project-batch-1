const express = require("express");
const CourseModel = require("../models/CourseModel");
const PurchaseModel = require("../models/PurchaseModel");
const courseRouter = express.Router();

courseRouter.get("/", async (req, res) => {
  const data = await CourseModel.getAll();
  res.send(data);
});

// student can purchase course

courseRouter.post("/purchase/:courseId", async (req, res) => {
  const { _id } = res.locals.user;
  const { courseId } = req.params;
  const data = await PurchaseModel.purchaseCourse(_id, courseId);
  res.send({
    message: `Course with id: ${courseId} purchased successfully!!!`,
    data: data,
  });
});

courseRouter.get("/enrolledCourses", async (req, res) => {
  const { _id: userId } = res.locals.user;
  const data = await PurchaseModel.getEnrolledCourses(userId);
  res.send(data);
});

module.exports = courseRouter;
