const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
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
    required: true
  },
  students: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('College', CollegeSchema);