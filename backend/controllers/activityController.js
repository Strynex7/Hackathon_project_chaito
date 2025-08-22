// Activity Controller for CryptoKindOnly
const { query } = require('../config/database');
const { createLogger, format, transports } = require('winston');

// Create logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/activity.log' })
  ]
});

// Get activity logs with pagination and filtering
async function getActivityLogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const action = req.query.action;
    const ipAddress = req.query.ip;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    
    // Build the query with filters
    let sql = 'SELECT * FROM activity_logs WHERE 1=1';
    const params = [];
    
    if (action) {
      sql += ' AND action = ?';
      params.push(action);
    }
    
    if (ipAddress) {
      sql += ' AND ip_address = ?';
      params.push(ipAddress);
    }
    
    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }
    
    // Add sorting and pagination
    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Execute the query
    const logs = await query(sql, params);
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1';
    const countParams = [];
    
    if (action) {
      countSql += ' AND action = ?';
      countParams.push(action);
    }
    
    if (ipAddress) {
      countSql += ' AND ip_address = ?';
      countParams.push(ipAddress);
    }
    
    if (startDate) {
      countSql += ' AND timestamp >= ?';
      countParams.push(startDate);
    }
    
    if (endDate) {
      countSql += ' AND timestamp <= ?';
      countParams.push(endDate);
    }
    
    const [totalResult] = await query(countSql, countParams);
    const total = totalResult.total;
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Error in getActivityLogs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get activity statistics
async function getActivityStats(req, res) {
  try {
    const startDate = req.query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to last 30 days
    const endDate = req.query.end_date || new Date().toISOString().split('T')[0]; // Default to today
    
    // Get count by action
    const actionSql = `
      SELECT action, COUNT(*) as count 
      FROM activity_logs 
      WHERE timestamp BETWEEN ? AND ? 
      GROUP BY action 
      ORDER BY count DESC
    `;
    
    const actionStats = await query(actionSql, [startDate, endDate]);
    
    // Get count by day
    const dailySql = `
      SELECT DATE(timestamp) as date, COUNT(*) as count 
      FROM activity_logs 
      WHERE timestamp BETWEEN ? AND ? 
      GROUP BY DATE(timestamp) 
      ORDER BY date
    `;
    
    const dailyStats = await query(dailySql, [startDate, endDate]);
    
    // Get top IP addresses
    const ipSql = `
      SELECT ip_address, COUNT(*) as count 
      FROM activity_logs 
      WHERE timestamp BETWEEN ? AND ? 
      GROUP BY ip_address 
      ORDER BY count DESC 
      LIMIT 10
    `;
    
    const ipStats = await query(ipSql, [startDate, endDate]);
    
    // Get total count
    const [totalResult] = await query(
      'SELECT COUNT(*) as total FROM activity_logs WHERE timestamp BETWEEN ? AND ?',
      [startDate, endDate]
    );
    
    res.json({
      success: true,
      data: {
        total: totalResult.total,
        byAction: actionStats,
        byDay: dailyStats,
        byIp: ipStats
      },
      timeframe: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    logger.error(`Error in getActivityStats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Clear old activity logs
async function clearOldLogs(req, res) {
  try {
    const olderThan = req.body.days || 90; // Default to 90 days
    
    if (olderThan < 1) {
      return res.status(400).json({
        success: false,
        message: 'Days parameter must be at least 1'
      });
    }
    
    const sql = 'DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)';
    const result = await query(sql, [olderThan]);
    
    logger.info(`Cleared ${result.affectedRows} old activity logs older than ${olderThan} days`);
    
    res.json({
      success: true,
      message: `Cleared ${result.affectedRows} old activity logs`,
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (error) {
    logger.error(`Error in clearOldLogs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to clear old activity logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getActivityLogs,
  getActivityStats,
  clearOldLogs
};