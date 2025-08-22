// Database initialization script for CryptoKindOnly
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();
const logger = require('../utils/logger');

/**
 * Initialize the database with schema
 */
async function initializeDatabase() {
  let connection;
  
  try {
    // Create connection without database name first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true // Allow multiple SQL statements
    });
    
    logger.info('Connected to MySQL server');
    
    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    logger.info('Initializing database schema...');
    await connection.query(schemaSql);
    
    logger.info('Database schema initialized successfully');
    return true;
  } catch (error) {
    logger.error(`Error initializing database: ${error.message}`);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        logger.info('Database initialization completed');
      } else {
        logger.error('Database initialization failed');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Unexpected error: ${error.message}`);
      process.exit(1);
    });
} else {
  // Export for use in other files
  module.exports = { initializeDatabase };
}