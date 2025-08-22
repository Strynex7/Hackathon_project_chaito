// Feedback Controller for CryptoKindOnly
const { query } = require('../config/database');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../utils/helpers');

/**
 * Submit user feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function submitFeedback(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required: name, email, subject, message'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedMessage = sanitizeInput(message);
    
    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || '0.0.0.0';
    
    // Insert feedback into database
    const sql = `
      INSERT INTO user_feedback (
        name, email, subject, message, ip_address, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'new', NOW())
    `;
    
    const result = await query(sql, [
      sanitizedName,
      sanitizedEmail,
      sanitizedSubject,
      sanitizedMessage,
      ipAddress
    ]);
    
    logger.info(`New feedback submitted by ${sanitizedName} (${sanitizedEmail})`);
    
    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    logger.error(`Error in submitFeedback: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while submitting feedback'
    });
  }
}

/**
 * Get all feedback (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllFeedback(req, res) {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filter by status if provided
    const status = req.query.status;
    let whereClause = '';
    let params = [];
    
    if (status && ['new', 'read', 'responded', 'closed'].includes(status)) {
      whereClause = 'WHERE status = ?';
      params = [status];
    }
    
    // Get feedback with pagination
    const sql = `
      SELECT * FROM user_feedback 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    // Get total count for pagination
    const countSql = `
      SELECT COUNT(*) as total FROM user_feedback 
      ${whereClause}
    `;
    
    // Execute both queries
    const [feedback, countResult] = await Promise.all([
      query(sql, [...params, limit, offset]),
      query(countSql, params)
    ]);
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      status: 'success',
      data: {
        feedback,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    logger.error(`Error in getAllFeedback: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving feedback'
    });
  }
}

/**
 * Update feedback status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateFeedbackStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status || !['new', 'read', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: new, read, responded, closed'
      });
    }
    
    // Check if feedback exists
    const checkSql = 'SELECT id FROM user_feedback WHERE id = ?';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }
    
    // Update feedback status
    const updateSql = 'UPDATE user_feedback SET status = ? WHERE id = ?';
    await query(updateSql, [status, id]);
    
    logger.info(`Feedback ID ${id} status updated to ${status}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Feedback status updated successfully'
    });
  } catch (error) {
    logger.error(`Error in updateFeedbackStatus: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating feedback status'
    });
  }
}

/**
 * Delete feedback (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;
    
    // Check if feedback exists
    const checkSql = 'SELECT id FROM user_feedback WHERE id = ?';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }
    
    // Delete feedback
    const deleteSql = 'DELETE FROM user_feedback WHERE id = ?';
    await query(deleteSql, [id]);
    
    logger.info(`Feedback ID ${id} deleted`);
    
    res.status(200).json({
      status: 'success',
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    logger.error(`Error in deleteFeedback: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting feedback'
    });
  }
}

module.exports = {
  submitFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback
};