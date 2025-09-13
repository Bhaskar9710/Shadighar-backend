

// Haversine Formula (distance in km)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ✅ Get All Venues
exports.getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Venue by ID
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ error: "Venue not found" });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Search Venues by type + nearby (15km)
exports.searchVenues = async (req, res) => {
  try {
    const { latitude, longitude, venueType } = req.body;

    // MongoDB fetch by type
    const venues = await Venue.find({ type: venueType });

    // Filter by 15km radius
    const nearbyVenues = venues.filter((venue) => {
      const dist = getDistance(latitude, longitude, venue.latitude, venue.longitude);
      return dist <= 15;
    });

    res.json(nearbyVenues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
