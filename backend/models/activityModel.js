// Activity Model for CryptoKindOnly
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Log user activity
 * @param {string} action - Action performed
 * @param {string} ip - User IP address
 * @param {string} details - Additional details
 * @returns {Promise<boolean>} Success status
 */
async function logActivity(action, ip, details = '') {
  try {
    const sql = `
      INSERT INTO activity_logs (
        action, ip_address, details, timestamp
      ) VALUES (?, ?, ?, NOW())
    `;
    
    await query(sql, [action, ip, details]);
    return true;
  } catch (error) {
    logger.error(`Error in logActivity: ${error.message}`);
    // Don't throw the error to prevent disrupting the main application flow
    return false;
  }
}

/**
 * Get activity logs with pagination and filtering
 * @param {number} limit - Number of results to return
 * @param {number} offset - Number of results to skip
 * @param {string} action - Filter by action
 * @param {string} ip - Filter by IP address
 * @param {string} startDate - Filter by start date
 * @param {string} endDate - Filter by end date
 * @returns {Promise<Object>} Object with logs array and total count
 */
async function getActivityLogs(limit = 50, offset = 0, action = '', ip = '', startDate = '', endDate = '') {
  try {
    // Build WHERE clause based on filters
    const whereConditions = [];
    const params = [];
    
    if (action) {
      whereConditions.push('action = ?');
      params.push(action);
    }
    
    if (ip) {
      whereConditions.push('ip_address = ?');
      params.push(ip);
    }
    
    if (startDate) {
      whereConditions.push('timestamp >= ?');
      params.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('timestamp <= ?');
      params.push(endDate);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Get logs with pagination
    const logsSQL = `
      SELECT * FROM activity_logs 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    
    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(*) as total FROM activity_logs 
      ${whereClause}
    `;
    
    // Execute both queries
    const logsParams = [...params, limit, offset];
    const [logs, countResult] = await Promise.all([
      query(logsSQL, logsParams),
      query(countSQL, params)
    ]);
    
    return {
      logs,
      total: countResult[0].total
    };
  } catch (error) {
    logger.error(`Error in getActivityLogs: ${error.message}`);
    throw error;
  }
}

/**
 * Get activity statistics
 * @returns {Promise<Object>} Object with various activity statistics
 */
async function getActivityStats() {
  try {
    // Get action counts
    const actionCountsSQL = `
      SELECT action, COUNT(*) as count 
      FROM activity_logs 
      GROUP BY action 
      ORDER BY count DESC
    `;
    
    // Get daily activity counts for the last 30 days
    const dailyActivitySQL = `
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count 
      FROM activity_logs 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;
    
    // Get top IP addresses
    const topIPsSQL = `
      SELECT ip_address, COUNT(*) as count 
      FROM activity_logs 
      GROUP BY ip_address 
      ORDER BY count DESC
      LIMIT 10
    `;
    
    // Execute all queries
    const [actionCounts, dailyActivity, topIPs] = await Promise.all([
      query(actionCountsSQL),
      query(dailyActivitySQL),
      query(topIPsSQL)
    ]);
    
    return {
      actionCounts,
      dailyActivity,
      topIPs
    };
  } catch (error) {
    logger.error(`Error in getActivityStats: ${error.message}`);
    throw error;
  }
}

/**
 * Clear old activity logs
 * @param {number} days - Number of days to keep
 * @returns {Promise<number>} Number of deleted logs
 */
async function clearOldLogs(days = 90) {
  try {
    const sql = `
      DELETE FROM activity_logs 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await query(sql, [days]);
    logger.info(`Cleared ${result.affectedRows} old activity logs`);
    
    return result.affectedRows;
  } catch (error) {
    logger.error(`Error in clearOldLogs: ${error.message}`);
    throw error;
  }
}

module.exports = {
  logActivity,
  getActivityLogs,
  getActivityStats,
  clearOldLogs
};