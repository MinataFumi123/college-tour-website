const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
        
        // Create new user
        user = new User({
            username,
            email,
            password
        });
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();
        
        // Create JWT token
        const payload = {
            user: {
                id: user.id
            }
        };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login route - FIXED to accept either email or username
router.post('/login', async (req, res) => {
    try {
        // Extract login credentials
        const { email, username, password } = req.body;
        
        console.log('Login attempt:', { email, username });
        
        // Find user by email OR username
        let user;
        if (email) {
            user = await User.findOne({ email });
        }
        
        // If user not found by email, try username
        if (!user && username) {
            user = await User.findOne({ username });
        }
        
        // If no user found at all
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password incorrect');
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create JWT token
        const payload = {
            user: {
                id: user.id
            }
        };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                
                // Return token and user details
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
        );
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;