const express = require("express");
const router = express.Router();
const Venue = require("../Models/Image");
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const newImage = new Image({
      url: req.file.path, // Cloudinary URL
      title: req.body.title || ""
    });
    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;