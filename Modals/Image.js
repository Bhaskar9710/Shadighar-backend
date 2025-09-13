const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String }, // optional, agar naam rakhna chaho
  category: { type: String, required: true },
});

module.exports = mongoose.model("Image", ImageSchema);
