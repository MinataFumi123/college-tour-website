const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
  // Core college information
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  established: {
    type: String,
    default: 'Unknown'
  },
  students: {
    type: String,
    default: 'Unknown'
  },
  type: {
    type: String,
    default: 'College'
  },
  
  // Additional tour information
  shortName: {
    type: String
  },
  tourInfo: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  
  // Location
  location: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  address: {
    type: String,
    required: true
  },
  
  // Administrative
  adminEmail: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tour', TourSchema);