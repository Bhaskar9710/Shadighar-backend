const venueSchema = new mongoose.Schema({
  placeId: { type: String, unique: true }, // 👈 unique id from Google
  name: { type: String, required: true },
  type: { type: String, required: true },
  address: { type: String },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  updatedAt: { type: Date, default: Date.now },
   image: { type: String },
});
