const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const cryptoRoutes = require('./routes/cryptoRoutes');
const activityRoutes = require('./routes/activityRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // Logging

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/crypto', cryptoRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/keys', apiKeyRoutes);

// ✅ Root route to verify backend is running
app.get('/', (req, res) => {
  res.send('Backend API is live 🚀');
});

// Serve static files from the frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes
