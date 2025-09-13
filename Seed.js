const mongoose = require("mongoose");
const Image = require("./models/Image");

// ✅ Apna MongoDB connection string daalo
mongoose.connect("mongodb://127.0.0.1:27017/wedding", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seed() {
  try {
    // Cloudinary ke URLs (jo tum Media Library me upload karoge)
    const images = [
      { url: "https://res.cloudinary.com/your_cloud/image/upload/v123456/photo1.jpg" },
      { url: "https://res.cloudinary.com/your_cloud/image/upload/v123456/photo2.jpg" },
      { url: "https://res.cloudinary.com/your_cloud/image/upload/v123456/photo3.jpg" },
      { url: "https://res.cloudinary.com/your_cloud/image/upload/v123456/photo4.jpg" },
    ];

    await Image.deleteMany(); // pehle purane images clear
    await Image.insertMany(images);

    console.log("✅ Images inserted successfully!");
  } catch (err) {
    console.error("❌ Error inserting images:", err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
