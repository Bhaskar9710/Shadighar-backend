require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const app = express();
const Image = require("./Modals/Image.js");
const authRoutes = require("./routes/Auth.js");
 const mailRoutes = require("./routes/Mail.js");

// ==========================
// ✅ Middleware
// ==========================
app.use(cors({
  origin: "https://shadighar.netlify.app/" 
}));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", mailRoutes);
// ==========================
// ✅ MongoDB connect
// ==========================
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));



// ✅ Configure Cloudinary before using it
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// ==========================
// ✅ Venue Schema (GeoJSON)
// ==========================
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // "resort" / "weddingHall"
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
   image: { type: String },
});

// 📌 Indexing for GeoSpatial Queries
venueSchema.index({ location: "2dsphere" });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "venues",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage });

const Venue = mongoose.model("Venue", venueSchema);


// ==========================
// 📍 Add Venue API with image upload
app.post("/api/venues/add", upload.single("image"), async (req, res) => {

  try {
    const { name, type, latitude, longitude } = req.body;

    if (!name || !type || !latitude || !longitude) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Latitude & Longitude must be valid numbers" });
    }

    // ✅ Image URL from Cloudinary
    const imageUrl = req.file?.secure_url || req.file?.path || "";

    const venue = new Venue({
      name,
      type,
      location: {
        type: "Point",
        coordinates: [lon, lat], // 👈 always [lng, lat]
      },
      image: imageUrl,
    });

    await venue.save();
    res.json({ success: true, venue });
  } catch (err) {
    console.error("❌ Error adding venue:", err);
    res.status(500).json({ error: "Server error" });
  }
  console.log("📂 Uploaded File:", req.file);

});



// ==========================
// 📍 Nearby Venues Search API
// ==========================
app.post("/api/venues/search", async (req, res) => {
  try {
    let { latitude, longitude, venueType } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude & Longitude required" });
    }

    // Convert to numbers
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Latitude & Longitude must be numbers" });
    }

    // Build query
    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude], // 👈 MongoDB expects [lng, lat]
          },
          $maxDistance: 20000, // 20 km
        },
      },
    };

    // Case-insensitive type filter
    if (venueType) {
      query.type = new RegExp(`^${venueType}$`, "i");
    }

    const venues = await Venue.find(query);

    res.json(venues);
  } catch (err) {
    console.error("❌ Error in /api/venues/search:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }

  console.log("📌 API response:", res.data);

});


///upload

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("📂 File:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newImage = new Image({
      url: req.file.secure_url || req.file.path,
      title: req.body.title || "",
      category: req.body.category || "Other",
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: err.message });
  }

  // console.log("📂 File Object:", JSON.stringify(req.file, null, 2));


});



//image 

app.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ _id: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// 📍 Get All Venues API
// ==========================
app.get("/api/venues", async (req, res) => {
  try {
    const venues = await Venue.find(); // saare venues laayega
    res.json(venues);
  } catch (err) {
    console.error("❌ Error fetching all venues:", err);
    res.status(500).json({ error: "Server error while fetching venues" });
  }
});

// ==========================
// 🚀 Server Start
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
