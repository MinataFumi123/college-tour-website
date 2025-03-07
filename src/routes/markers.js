/**
 * Markers API route handling
 * This module provides endpoints for map marker data
 */

const express = require('express');
const router = express.Router();

// In-memory marker storage (replace with MongoDB when ready)
let markers = [];

// Get markers for a specific college
router.get('/college/:collegeId', (req, res) => {
    const collegeId = req.params.collegeId;
    const collegeMarkers = markers.filter(marker => marker.collegeId === collegeId);
    res.json(collegeMarkers);
});

module.exports = router;