// routes/venues.js
const express = require("express");
const router = express.Router();
const Venue = require("../Models/Venue"); // DB Model

// Haversine formula to calculate distance (in km)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 📍 Search venues within 15km by type + location
router.post("/search", async (req, res) => {
  try {
    const { latitude, longitude, venueType } = req.body;

    if (!latitude || !longitude || !venueType) {
      return res.status(400).json({ error: "latitude, longitude, and venueType required" });
    }

    // fetch all venues of given type
    const venues = await Venue.find({ type: venueType });

    // filter within 15km
    const nearbyVenues = venues.filter(venue => {
      const dist = getDistance(latitude, longitude, venue.latitude, venue.longitude);
      return dist <= 15;
    });

    res.json(nearbyVenues);
  } catch (err) {
    console.error("❌ Venue search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
