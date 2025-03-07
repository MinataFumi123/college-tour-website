const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  college: {  // Keep the name 'college' for backward compatibility
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',  // Changed from 'College' to 'Tour'
    required: true
  }
});

module.exports = mongoose.model('Course', CourseSchema);