// Crypto Model for CryptoKindOnly
const { pool, query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get latest cryptocurrency listings from database
 * @param {number} limit - Number of results to return
 * @param {number} offset - Number of results to skip
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc or desc)
 * @returns {Promise<Array>} Array of cryptocurrency listings
 */
async function getLatestListings(limit = 100, offset = 0, sortBy = 'market_cap', sortOrder = 'desc') {
  try {
    // Validate sort parameters to prevent SQL injection
    const validSortFields = ['market_cap', 'price', 'volume_24h', 'percent_change_24h', 'name', 'symbol'];
    const validSortOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'market_cap';
    }
    
    if (!validSortOrders.includes(sortOrder.toLowerCase())) {
      sortOrder = 'desc';
    }
    
    const sql = `
      SELECT * FROM cryptocurrencies 
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const result = await query(sql, [limit, offset]);
    return result;
  } catch (error) {
    logger.error(`Error in getLatestListings: ${error.message}`);
    throw error;
  }
}

/**
 * Get cryptocurrency details by ID
 * @param {number} id - Cryptocurrency ID
 * @returns {Promise<Object>} Cryptocurrency details
 */
async function getCryptoDetails(id) {
  try {
    const sql = 'SELECT * FROM cryptocurrencies WHERE id = ?';
    const result = await query(sql, [id]);
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0];
  } catch (error) {
    logger.error(`Error in getCryptoDetails: ${error.message}`);
    throw error;
  }
}

/**
 * Search cryptocurrencies by name or symbol
 * @param {string} searchTerm - Search term
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Array of matching cryptocurrencies
 */
async function searchCryptocurrencies(searchTerm, limit = 20) {
  try {
    const sql = `
      SELECT * FROM cryptocurrencies 
      WHERE name LIKE ? OR symbol LIKE ? 
      ORDER BY market_cap DESC
      LIMIT ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await query(sql, [searchPattern, searchPattern, limit]);
    
    return result;
  } catch (error) {
    logger.error(`Error in searchCryptocurrencies: ${error.message}`);
    throw error;
  }
}

/**
 * Get historical data for a cryptocurrency
 * @param {number} id - Cryptocurrency ID
 * @param {string} timeframe - Timeframe (1d, 7d, 30d, 90d, 1y, all)
 * @returns {Promise<Array>} Array of historical data points
 */
async function getHistoricalData(id, timeframe = '30d') {
  try {
    // Map timeframe to SQL date calculation
    let dateFilter;
    switch (timeframe) {
      case '1d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 DAY)';
        break;
      case '7d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
      case '1y':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        break;
      case 'all':
        dateFilter = '(SELECT MIN(timestamp) FROM historical_prices WHERE crypto_id = ?)';
        break;
      default:
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }
    
    const sql = `
      SELECT * FROM historical_prices 
      WHERE crypto_id = ? AND timestamp >= ${dateFilter}
      ORDER BY timestamp ASC
    `;
    
    const params = timeframe === 'all' ? [id, id] : [id];
    const result = await query(sql, params);
    
    return result;
  } catch (error) {
    logger.error(`Error in getHistoricalData: ${error.message}`);
    throw error;
  }
}

/**
 * Get top gainers and losers
 * @param {number} limit - Number of results to return for each category
 * @returns {Promise<Object>} Object with gainers and losers arrays
 */
async function getTopGainersLosers(limit = 10) {
  try {
    // Get top gainers
    const gainersSQL = `
      SELECT * FROM cryptocurrencies 
      WHERE percent_change_24h > 0
      ORDER BY percent_change_24h DESC
      LIMIT ?
    `;
    
    // Get top losers
    const losersSQL = `
      SELECT * FROM cryptocurrencies 
      WHERE percent_change_24h < 0
      ORDER BY percent_change_24h ASC
      LIMIT ?
    `;
    
    const [gainers, losers] = await Promise.all([
      query(gainersSQL, [limit]),
      query(losersSQL, [limit])
    ]);
    
    return { gainers, losers };
  } catch (error) {
    logger.error(`Error in getTopGainersLosers: ${error.message}`);
    throw error;
  }
}

/**
 * Update cryptocurrency data in database
 * @param {Array} cryptoData - Array of cryptocurrency data objects
 * @returns {Promise<boolean>} Success status
 */
async function updateCryptoData(cryptoData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Prepare SQL for inserting or updating cryptocurrency data
    const sql = `
      INSERT INTO cryptocurrencies (
        id, name, symbol, slug, price, volume_24h, market_cap, 
        percent_change_1h, percent_change_24h, percent_change_7d, 
        circulating_supply, total_supply, max_supply, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        price = VALUES(price),
        volume_24h = VALUES(volume_24h),
        market_cap = VALUES(market_cap),
        percent_change_1h = VALUES(percent_change_1h),
        percent_change_24h = VALUES(percent_change_24h),
        percent_change_7d = VALUES(percent_change_7d),
        circulating_supply = VALUES(circulating_supply),
        total_supply = VALUES(total_supply),
        max_supply = VALUES(max_supply),
        last_updated = NOW()
    `;
    
    // Execute batch insert/update
    for (const crypto of cryptoData) {
      await connection.query(sql, [
        crypto.id,
        crypto.name,
        crypto.symbol,
        crypto.slug,
        crypto.price,
        crypto.volume_24h,
        crypto.market_cap,
        crypto.percent_change_1h,
        crypto.percent_change_24h,
        crypto.percent_change_7d,
        crypto.circulating_supply,
        crypto.total_supply,
        crypto.max_supply
      ]);
    }
    
    await connection.commit();
    logger.info(`Updated ${cryptoData.length} cryptocurrencies in database`);
    return true;
  } catch (error) {
    await connection.rollback();
    logger.error(`Error in updateCryptoData: ${error.message}`);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getLatestListings,
  getCryptoDetails,
  searchCryptocurrencies,
  getHistoricalData,
  getTopGainersLosers,
  updateCryptoData
};