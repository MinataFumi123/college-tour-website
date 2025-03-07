const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
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

module.exports = mongoose.model('Event', EventSchema);