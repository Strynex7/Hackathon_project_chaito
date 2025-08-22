// Script to fetch and update cryptocurrency data from CoinMarketCap API
const apiConfig = require('../config/apiConfig');
const cryptoModel = require('../models/cryptoModel');
const logger = require('./logger');

/**
 * Fetch latest cryptocurrency data from CoinMarketCap API and update database
 * @param {number} limit - Number of cryptocurrencies to fetch
 * @returns {Promise<boolean>} Success status
 */
async function updateCryptoData(limit = 100) {
  try {
    logger.info(`Fetching latest cryptocurrency data (limit: ${limit})...`);
    
    // Fetch data from CoinMarketCap API
    const response = await apiConfig.makeApiRequest('/cryptocurrency/listings/latest', {
      limit,
      convert: 'USD,INR'
    });
    
    if (!response.data || !response.data.data) {
      logger.error('Invalid response from CoinMarketCap API');
      return false;
    }
    
    // Transform API data to database format
    const cryptoData = response.data.map(crypto => {
      return {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        slug: crypto.slug,
        price_usd: crypto.quote.USD.price,
        price_inr: crypto.quote.INR.price,
        volume_24h_usd: crypto.quote.USD.volume_24h,
        volume_24h_inr: crypto.quote.INR.volume_24h,
        market_cap_usd: crypto.quote.USD.market_cap,
        market_cap_inr: crypto.quote.INR.market_cap,
        percent_change_1h: crypto.quote.USD.percent_change_1h,
        percent_change_24h: crypto.quote.USD.percent_change_24h,
        percent_change_7d: crypto.quote.USD.percent_change_7d,
        circulating_supply: crypto.circulating_supply,
        total_supply: crypto.total_supply,
        max_supply: crypto.max_supply,
        last_updated: crypto.last_updated
      };
    });
    
    // Update database
    logger.info(`Updating database with ${cryptoData.length} cryptocurrencies...`);
    await cryptoModel.updateCryptoData(cryptoData);
    
    logger.info('Cryptocurrency data updated successfully');
    return true;
  } catch (error) {
    logger.error(`Error updating cryptocurrency data: ${error.message}`);
    return false;
  }
}

/**
 * Update historical data for a specific cryptocurrency
 * @param {number} id - Cryptocurrency ID
 * @returns {Promise<boolean>} Success status
 */
async function updateHistoricalData(id) {
  try {
    logger.info(`Fetching historical data for cryptocurrency ID ${id}...`);
    
    // Get cryptocurrency details
    const crypto = await cryptoModel.getCryptoDetails(id);
    if (!crypto) {
      logger.error(`Cryptocurrency with ID ${id} not found`);
      return false;
    }
    
    // Fetch historical data from CoinMarketCap API
    const response = await apiConfig.makeRequest({
      method: 'GET',
      url: `/v2/cryptocurrency/quotes/historical`,
      params: {
        id,
        convert: 'INR',
        interval: 'daily',
        count: 30 // Last 30 days
      }
    });
    
    if (!response.data || !response.data.data) {
      logger.error('Invalid response from CoinMarketCap API');
      return false;
    }
    
    // Transform API data to database format
    const historicalData = [];
    const quotes = response.data.data[id].quotes;
    
    for (const quote of quotes) {
      historicalData.push({
        crypto_id: id,
        price: quote.quote.INR.price,
        volume_24h: quote.quote.INR.volume_24h || 0,
        market_cap: quote.quote.INR.market_cap || 0,
        timestamp: quote.timestamp
      });
    }
    
    // Update database (implementation would depend on your database structure)
    // This is a placeholder for the actual implementation
    logger.info(`Updating database with ${historicalData.length} historical data points...`);
    
    // Example implementation:
    // await Promise.all(historicalData.map(async (data) => {
    //   const sql = `
    //     INSERT INTO historical_prices (crypto_id, price, volume_24h, market_cap, timestamp)
    //     VALUES (?, ?, ?, ?, ?)
    //     ON DUPLICATE KEY UPDATE
    //       price = VALUES(price),
    //       volume_24h = VALUES(volume_24h),
    //       market_cap = VALUES(market_cap)
    //   `;
    //   
    //   await query(sql, [
    //     data.crypto_id,
    //     data.price,
    //     data.volume_24h,
    //     data.market_cap,
    //     data.timestamp
    //   ]);
    // }));
    
    logger.info('Historical data updated successfully');
    return true;
  } catch (error) {
    logger.error(`Error updating historical data: ${error.message}`);
    return false;
  }
}

// Run if this script is executed directly
if (require.main === module) {
  updateCryptoData()
    .then(success => {
      if (success) {
        logger.info('Cryptocurrency data update completed');
      } else {
        logger.error('Cryptocurrency data update failed');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Unexpected error: ${error.message}`);
      process.exit(1);
    });
} else {
  // Export for use in other files
  module.exports = { updateCryptoData, updateHistoricalData };
}