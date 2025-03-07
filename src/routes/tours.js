const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Tour = require('../models/Tour');
const Course = require('../models/Course');
const Event = require('../models/Event');

// Add this function at the top of your tours.js routes file
function formatTourResponse(tour) {
  // Convert MongoDB _id to id for frontend compatibility
  const formattedTour = tour.toObject ? tour.toObject() : {...tour};
  formattedTour.id = formattedTour._id.toString();
  return formattedTour;
}

// Authentication middleware
const authMiddleware = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // For development/testing, allow requests without auth
  if (!token && process.env.NODE_ENV === 'development') {
    console.log('⚠️ Auth bypassed in development mode');
    req.user = { id: 'dev-user' };
    return next();
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecretkey');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Debug endpoint - useful for testing
router.get('/test', (req, res) => {
  res.json({ message: 'Tours API is working' });
});

// Get all tours
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/tours - Fetching all tours');
    const tours = await Tour.find();
    console.log(`Found ${tours.length} tours`);
    const formattedTours = tours.map(tour => formatTourResponse(tour));
    res.json(formattedTours);
  } catch (err) {
    console.error('Error fetching tours:', err);
    res.status(500).json({ message: 'Server error fetching tours' });
  }
});

// Create a new tour
router.post('/', authMiddleware, async (req, res) => {
  console.log('POST /api/tours - Creating new tour');
  console.log('Request body:', req.body);
  
  try {
    const newTour = new Tour({
      name: req.body.name,
      shortName: req.body.shortName,
      description: req.body.description,
      location: req.body.location || [0, 0],
      address: req.body.address || '',
      established: req.body.established || 'Unknown',
      type: req.body.type || 'College',
      students: req.body.students || 'Unknown',
      tourInfo: req.body.tourInfo,
      image: req.body.image || 'https://via.placeholder.com/300',
      adminEmail: req.body.adminEmail
    });

    console.log('Tour object created, saving to database...');
    const savedTour = await newTour.save();
    console.log('Tour saved successfully:', savedTour._id);
    res.json(formatTourResponse(savedTour));
  } catch (err) {
    console.error('Error creating tour:', err);
    res.status(500).json({ message: 'Error saving tour: ' + err.message });
  }
});

// Get a single tour
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/tours/${req.params.id} - Fetching tour`);
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      console.log(`Tour not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(formatTourResponse(tour));
  } catch (err) {
    console.error('Error fetching tour:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a tour
router.put('/:id', authMiddleware, async (req, res) => {
  console.log(`PUT /api/tours/${req.params.id} - Updating tour`);
  try {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Only allow updates by the admin who created it (if adminEmail exists)
    if (tour.adminEmail && tour.adminEmail !== req.body.adminEmail) {
      return res.status(403).json({ message: 'Not authorized to edit this tour' });
    }
    
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      req.body,
      { new: true }
    );
    
    console.log('Tour updated successfully');
    res.json(formatTourResponse(updatedTour));
  } catch (err) {
    console.error('Error updating tour:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a tour
router.delete('/:id', authMiddleware, async (req, res) => {
  console.log(`DELETE /api/tours/${req.params.id} - Deleting tour`);
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    await Tour.findByIdAndDelete(req.params.id);
    console.log('Tour deleted successfully');
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    console.error('Error deleting tour:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// COURSES ROUTES - using tourId (formerly collegeId)
// Get courses for a tour/college
router.get('/:tourId/courses', async (req, res) => {
  try {
    console.log(`GET /api/tours/${req.params.tourId}/courses - Fetching courses`);
    
    // Validate the tourId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.tourId)) {
      console.log(`Invalid tour ID format: ${req.params.tourId}`);
      return res.status(400).json({ message: 'Invalid tour ID format' });
    }
    
    // First, verify the tour exists
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      console.log(`Tour not found with ID: ${req.params.tourId}`);
      return res.status(404).json({ message: 'College/tour not found' });
    }
    
    // Then find related courses
    const courses = await Course.find({ college: req.params.tourId });
    console.log(`Found ${courses.length} courses for tour: ${req.params.tourId}`);
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a course to a tour/college
router.post('/:tourId/courses', async (req, res) => {
  try {
    console.log(`POST /api/tours/${req.params.tourId}/courses - Adding course`);
    console.log('Course data:', req.body);
    
    // Validate the tourId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.tourId)) {
      console.log(`Invalid tour ID format: ${req.params.tourId}`);
      return res.status(400).json({ message: 'Invalid tour ID format' });
    }
    
    // First, verify the tour exists
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      console.log(`Tour not found with ID: ${req.params.tourId}`);
      return res.status(404).json({ message: 'College/tour not found' });
    }

    // Create new course
    const newCourse = new Course({
      name: req.body.name,
      description: req.body.description,
      college: req.params.tourId  // Link the course to this tour/college
    });

    const course = await newCourse.save();
    console.log(`Added new course: ${course._id} for tour: ${req.params.tourId}`);
    res.status(201).json(course);
  } catch (err) {
    console.error('Error adding course:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a course
router.delete('/:tourId/courses/:courseId', authMiddleware, async (req, res) => {
  try {
    console.log(`DELETE /api/tours/${req.params.tourId}/courses/${req.params.courseId} - Deleting course`);
    
    // Validate IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId) ||
        !mongoose.Types.ObjectId.isValid(req.params.tourId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      console.log(`Course not found with ID: ${req.params.courseId}`);
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course belongs to this tour/college
    if (course.college.toString() !== req.params.tourId) {
      console.log(`Course ${req.params.courseId} does not belong to tour ${req.params.tourId}`);
      return res.status(400).json({ message: 'Course does not belong to this college' });
    }

    await Course.deleteOne({ _id: req.params.courseId });
    console.log(`Deleted course: ${req.params.courseId}`);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// EVENTS ROUTES
// Get events for a tour/college
router.get('/:tourId/events', async (req, res) => {
  try {
    console.log(`GET /api/tours/${req.params.tourId}/events - Fetching events`);
    
    // Validate the tourId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.tourId)) {
      console.log(`Invalid tour ID format: ${req.params.tourId}`);
      return res.status(400).json({ message: 'Invalid tour ID format' });
    }
    
    // First verify the tour exists
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      console.log(`Tour not found with ID: ${req.params.tourId}`);
      return res.status(404).json({ message: 'College/tour not found' });
    }
    
    const events = await Event.find({ college: req.params.tourId });
    console.log(`Found ${events.length} events for tour: ${req.params.tourId}`);
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add an event to a tour/college
router.post('/:tourId/events', async (req, res) => {
  try {
    console.log(`POST /api/tours/${req.params.tourId}/events - Adding event`);
    console.log('Event data:', req.body);
    
    // Validate the tourId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.tourId)) {
      console.log(`Invalid tour ID format: ${req.params.tourId}`);
      return res.status(400).json({ message: 'Invalid tour ID format' });
    }
    
    // First verify the tour exists
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      console.log(`Tour not found with ID: ${req.params.tourId}`);
      return res.status(404).json({ message: 'College/tour not found' });
    }

    const { title, date, description } = req.body;
    if (!title || !date || !description) {
      return res.status(400).json({ message: 'Title, date, and description are required' });
    }

    const newEvent = new Event({
      title,
      date,
      description,
      college: req.params.tourId  // Link the event to this tour/college
    });

    const event = await newEvent.save();
    console.log(`Added new event: ${event._id} for tour: ${req.params.tourId}`);
    res.status(201).json(event);
  } catch (err) {
    console.error('Error adding event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete an event
router.delete('/:tourId/events/:eventId', authMiddleware, async (req, res) => {
  try {
    console.log(`DELETE /api/tours/${req.params.tourId}/events/${req.params.eventId} - Deleting event`);
    
    // Validate IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId) ||
        !mongoose.Types.ObjectId.isValid(req.params.tourId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      console.log(`Event not found with ID: ${req.params.eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event belongs to this tour/college
    if (event.college.toString() !== req.params.tourId) {
      console.log(`Event ${req.params.eventId} does not belong to tour ${req.params.tourId}`);
      return res.status(400).json({ message: 'Event does not belong to this college' });
    }

    await Event.deleteOne({ _id: req.params.eventId });
    console.log(`Deleted event: ${req.params.eventId}`);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;