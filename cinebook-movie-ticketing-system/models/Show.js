const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    title: { type: String },
    posterUrl: { type: String },
    screen: { type: String },
    startTime: { type: Date },
    seats: [String],
    pricing: { A: Number, B: Number, C: Number },
    currency: { type: String },
  }
);

const ShowModel = mongoose.model("Show", showSchema);

module.exports = ShowModel;
