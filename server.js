const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Add at the top of your file, after the imports
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit in development to allow nodemon to restart
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development to allow nodemon to restart
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - IMPORTANT: These come first
app.use(express.json({ limit: '5mb' })); // Increase limit if needed
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// CORS configuration with proper methods and credentials support
app.use(cors({
  origin: '*', // In production, replace with your actual domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Allow preflight for all routes
app.options('*', cors());

// Request logging with more details
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
    
    // Add response logging
    const originalSend = res.send;
    res.send = function(body) {
        console.log(`${timestamp} - Response: ${res.statusCode}`);
        return originalSend.call(this, body);
    };
    
    next();
});

// API Routes - These should come BEFORE static files
// Import route modules
const authRoutes = require('./src/routes/auth');
const toursRoutes = require('./src/routes/tours');
// We'll keep colleges for backward compatibility but will merge functionality
const markersRoutes = require('./src/routes/markers');

// Register routes with correct prefixes
app.use('/api/auth', authRoutes);
app.use('/api/tours', toursRoutes);
// Keep the colleges routes as a proxy to tours for backward compatibility
app.use('/api/colleges', (req, res, next) => {
  console.log(`Redirecting /api/colleges${req.url} to /api/tours${req.url}`);
  req.url = `/api/tours${req.url}`;
  toursRoutes(req, res, next);
});
app.use('/api/markers', markersRoutes);

// AFTER API routes, serve static files
app.use(express.static(path.join(__dirname, 'src')));

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1,
    version: '1.1.0' // Add a version number for tracking
  });
});

// Add this for debugging
app.get('/api/debug-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/') + handler.route.path;
          routes.push({
            path: path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// Add this to check auth tokens
app.get('/api/check-auth', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ authenticated: false, message: 'No token provided' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ 
      authenticated: true,
      user: decoded.user,
      expires: new Date(decoded.exp * 1000)
    });
  } catch (err) {
    return res.status(401).json({ 
      authenticated: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Use default options (no longer need to specify them)
    });
    console.log('✅ MongoDB Connected Successfully');
    return true;
  } catch (err) {
    if (retries <= 0) {
      console.error('❌ MongoDB Connection Error:', err);
      console.log('Continuing without database connection...');
      return false;
    }
    console.log(`MongoDB connection failed, retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    return connectDB(retries - 1);
  }
};

connectDB();

// MongoDB connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    // Check mongoose connection state
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Test writing to the database with a simple document
    if (connectionState === 1) {
      const TestModel = mongoose.model('TestModel', new mongoose.Schema({ 
        name: String, 
        date: { type: Date, default: Date.now } 
      }), 'db_tests');
      
      const testDoc = new TestModel({ name: 'Connection Test' });
      await testDoc.save();
      
      // Clean up - delete the test document
      await TestModel.deleteMany({ name: 'Connection Test' });
    }

    res.json({
      connectionState: states[connectionState] || 'unknown',
      databaseName: mongoose.connection.name || 'not connected',
      canWrite: connectionState === 1 ? 'yes' : 'no',
      uri: process.env.MONGODB_URI?.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@') || 'Not set'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'Not available'
    });
  }
});

// Error handling middleware - MUST be after all routes
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Catch-all route - This must be LAST (after error handler)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/index.html'));
});

// Replace your existing app.listen code with this:
const startServer = (attemptedPort) => {
  const server = app.listen(attemptedPort)
    .on('listening', () => {
      console.log('=============================================');
      console.log(`✅ Server running on http://localhost:${attemptedPort}`);
      console.log(`- API available at http://localhost:${attemptedPort}/api`);
      console.log(`- Dashboard at http://localhost:${attemptedPort}/views/dashboard.html`);
      console.log('=============================================');
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attemptedPort < 3010) {
        // Try next port
        console.log(`⚠️ Port ${attemptedPort} is busy, trying port ${attemptedPort + 1}`);
        server.close();
        startServer(attemptedPort + 1);
      } else {
        console.error(`❌ Error starting server: ${err.message}`);
      }
    });
};

// Start with preferred port, but try alternatives if busy
startServer(PORT);

// If the environment supports it, configure clean shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}