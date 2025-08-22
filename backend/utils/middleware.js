// Middleware utilities for CryptoKindOnly
const rateLimit = require('express-rate-limit');
const { sanitizeInput } = require('./helpers');
const logger = require('./logger');

/**
 * Create a rate limiter middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests in the time window
 * @param {string} message - Message to send when rate limit is exceeded
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs || process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // Default: 15 minutes
    max: max || process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Default: 100 requests per windowMs
    message: {
      status: 'error',
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Store client IP in request for logging
    keyGenerator: (req) => {
      return req.ip;
    },
    // Log when rate limit is hit
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.ip}`);
      res.status(429).json(options.message);
    }
  });
};

/**
 * Middleware to validate request parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequestParams = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    });
  }
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  
  next();
};

/**
 * Middleware to log API requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logApiRequest = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  logger.http(`API Request: ${req.method} ${req.originalUrl} from ${req.ip}`);
  
  // Log response time on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`API Response: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}\nStack: ${err.stack}`);
  
  // Send error response
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
};

/**
 * Not found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
  logger.warn(`Not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
};

module.exports = {
  createRateLimiter,
  validateRequestParams,
  logApiRequest,
  errorHandler,
  notFound
};