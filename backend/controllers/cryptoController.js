// Crypto Controller for CryptoKindOnly
const { makeApiRequest } = require('../config/apiConfig');
const { query } = require('../config/database');
const { createLogger, format, transports } = require('winston');
const NodeCache = require('node-cache');

// Create a cache with a default TTL of 5 minutes (300 seconds)
const cryptoCache = new NodeCache({ stdTTL: 300 });

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
    new transports.File({ filename: 'logs/crypto.log' })
  ]
});

// Get latest listings of cryptocurrencies
async function getLatestListings(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const start = parseInt(req.query.start) || 1;
    const sortBy = req.query.sort || 'market_cap';
    const sortDir = req.query.sort_dir || 'desc';
    const convert = req.query.convert || 'INR';
    
    const params = {
      start,
      limit,
      sort: sortBy,
      sort_dir: sortDir,
      convert
    };
    
    const data = await makeApiRequest('/cryptocurrency/listings/latest', params);
    
    // Log this activity
    await logActivity(req.ip, 'getLatestListings', params);
    
    res.json({
      success: true,
      data: data.data,
      metadata: data.status
    });
  } catch (error) {
    logger.error(`Error in getLatestListings: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cryptocurrency listings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get specific cryptocurrency details
async function getCryptoDetails(req, res) {
  try {
    const id = req.params.id;
    const convert = req.query.convert || 'INR';
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Cryptocurrency ID is required'
      });
    }
    
    const params = {
      id,
      convert
    };
    
    const data = await makeApiRequest('/cryptocurrency/quotes/latest', params);
    
    // Log this activity
    await logActivity(req.ip, 'getCryptoDetails', { id, convert });
    
    res.json({
      success: true,
      data: data.data[id],
      metadata: data.status
    });
  } catch (error) {
    logger.error(`Error in getCryptoDetails: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cryptocurrency details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Search cryptocurrencies
async function searchCryptocurrencies(req, res) {
  try {
    const searchQuery = req.query.query;
    const limit = parseInt(req.query.limit) || 10;
    const convert = req.query.convert || 'INR';
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // First try to search by symbol
    const symbolParams = {
      symbol: searchQuery.toUpperCase(),
      convert
    };
    
    let data;
    try {
      data = await makeApiRequest('/cryptocurrency/quotes/latest', symbolParams);
    } catch (error) {
      // If symbol search fails, try searching by name using the /cryptocurrency/map endpoint
      const mapParams = {
        limit,
        listing_status: 'active'
      };
      
      const mapData = await makeApiRequest('/cryptocurrency/map', mapParams);
      
      // Filter results by name (case-insensitive)
      const filteredData = mapData.data.filter(crypto => 
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, limit);
      
      // If we have results, get quotes for these cryptocurrencies
      if (filteredData.length > 0) {
        const ids = filteredData.map(crypto => crypto.id).join(',');
        
        const quotesParams = {
          id: ids,
          convert
        };
        
        data = await makeApiRequest('/cryptocurrency/quotes/latest', quotesParams);
      } else {
        // No results found
        return res.json({
          success: true,
          data: [],
          metadata: mapData.status
        });
      }
    }
    
    // Log this activity
    await logActivity(req.ip, 'searchCryptocurrencies', { query: searchQuery, limit, convert });
    
    // Format the response
    const formattedData = Object.values(data.data);
    
    res.json({
      success: true,
      data: formattedData,
      metadata: data.status
    });
  } catch (error) {
    logger.error(`Error in searchCryptocurrencies: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to search cryptocurrencies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get historical data for a cryptocurrency
async function getHistoricalData(req, res) {
  try {
    const id = req.params.id;
    const convert = req.query.convert || 'INR';
    const interval = req.query.interval || 'daily';
    const timeStart = req.query.time_start || '';
    const timeEnd = req.query.time_end || '';
    const count = parseInt(req.query.count) || 10;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Cryptocurrency ID is required'
      });
    }
    
    const params = {
      id,
      convert,
      interval,
      count
    };
    
    if (timeStart) params.time_start = timeStart;
    if (timeEnd) params.time_end = timeEnd;
    
    const data = await makeApiRequest('/cryptocurrency/quotes/historical', params);
    
    // Log this activity
    await logActivity(req.ip, 'getHistoricalData', { id, convert, interval, count });
    
    res.json({
      success: true,
      data: data.data,
      metadata: data.status
    });
  } catch (error) {
    logger.error(`Error in getHistoricalData: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get top gainers and losers
async function getTopGainersLosers(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const convert = req.query.convert || 'INR';
    const timeframe = req.query.timeframe || '24h'; // 1h, 24h, 7d, 30d
    
    // Get latest listings with a higher limit to ensure we have enough data
    const params = {
      limit: Math.max(limit * 5, 100), // Get at least 100 cryptocurrencies
      convert
    };
    
    const data = await makeApiRequest('/cryptocurrency/listings/latest', params);
    
    // Determine which percent change field to use based on timeframe
    let percentChangeField;
    switch (timeframe) {
      case '1h':
        percentChangeField = 'percent_change_1h';
        break;
      case '7d':
        percentChangeField = 'percent_change_7d';
        break;
      case '30d':
        percentChangeField = 'percent_change_30d';
        break;
      default:
        percentChangeField = 'percent_change_24h';
    }
    
    // Sort by percent change
    const sortedData = [...data.data];
    sortedData.sort((a, b) => {
      const aChange = a.quote[convert][percentChangeField] || 0;
      const bChange = b.quote[convert][percentChangeField] || 0;
      return bChange - aChange; // Descending order
    });
    
    // Get top gainers and losers
    const gainers = sortedData.slice(0, limit);
    const losers = sortedData.slice(-limit).reverse();
    
    // Log this activity
    await logActivity(req.ip, 'getTopGainersLosers', { limit, convert, timeframe });
    
    res.json({
      success: true,
      data: {
        gainers,
        losers
      },
      metadata: data.status
    });
  } catch (error) {
    logger.error(`Error in getTopGainersLosers: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top gainers and losers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Log API activity to database
async function logActivity(ip, action, params) {
  try {
    const sql = `
      INSERT INTO activity_logs (ip_address, action, parameters, timestamp)
      VALUES (?, ?, ?, NOW())
    `;
    
    await query(sql, [ip, action, JSON.stringify(params)]);
    logger.info(`Logged activity: ${action} from ${ip}`);
  } catch (error) {
    logger.error(`Error logging activity: ${error.message}`);
    // Don't throw the error - we don't want to fail the main request if logging fails
  }
}

// Get top 50 cryptocurrencies with detailed information
async function getTopFiftyCryptos(req, res) {
  try {
    // Check if data is in cache
    const cacheKey = 'top50cryptos';
    const cachedData = cryptoCache.get(cacheKey);
    
    if (cachedData) {
      logger.info('Returning cached top 50 cryptocurrencies data');
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    // If not in cache, fetch from API
    const params = {
      limit: 50,
      sort: 'market_cap',
      sort_dir: 'desc',
      convert: 'USD,INR'
    };
    
    const data = await makeApiRequest('/cryptocurrency/listings/latest', params);
    
    // Transform data to include only required fields
    const transformedData = data.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price_usd: coin.quote.USD.price,
      price_inr: coin.quote.INR.price,
      market_cap: coin.quote.USD.market_cap,
      percent_change_24h: coin.quote.USD.percent_change_24h,
      volume_24h: coin.quote.USD.volume_24h,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply,
      last_updated: coin.last_updated
    }));
    
    // Store in cache
    cryptoCache.set(cacheKey, transformedData);
    
    // Log this activity
    await logActivity(req.ip, 'getTopFiftyCryptos', params);
    
    res.json({
      success: true,
      data: transformedData,
      metadata: data.status,
      cached: false
    });
  } catch (error) {
    logger.error(`Error in getTopFiftyCryptos: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top 50 cryptocurrencies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getLatestListings,
  getCryptoDetails,
  searchCryptocurrencies,
  getHistoricalData,
  getTopGainersLosers,
  getTopFiftyCryptos
};