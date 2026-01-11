const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  refunded: { type: Boolean, default: false },
  purchaseDate: { type: Date, default: Date.now },
});

purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

purchaseSchema.statics.purchaseCourse = async (userId, courseId) => {
  return await PurchaseModel.create({ userId, courseId });
};

purchaseSchema.statics.getEnrolledCourses = async (userId) => {
  return await PurchaseModel.find({ userId, refunded: false }).populate(
    "courseId"
  );
};

// Admin action Refund Course
purchaseSchema.statics.refundCourse = async ({ userId, courseId }) => {
  return await PurchaseModel.findOneAndUpdate(
    { userId, courseId, refunded: false },
    { refunded: true },
    { new: true }
  );
};

// top selling courses
purchaseSchema.statics.getTopSellingCourses = async (limit = 3) => {
  return PurchaseModel.aggregate([
    { $match: { refunded: false } },

    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },

    {
      $group: {
        _id: "$courseId",
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$course.price" },
        title: { $first: "$course.title" },
        price: { $first: "$course.price" },
      },
    },

    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
  ]);
};

const PurchaseModel = mongoose.model("Purchase", purchaseSchema);

module.exports = PurchaseModel;
